from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import Optional
import logging

logger = logging.getLogger(__name__)

AVERAGE_SPEED_MPH = 55.0
MAX_DRIVING_HOURS = 11.0
MAX_WINDOW_HOURS = 14.0
BREAK_REQUIRED_AFTER_HOURS = 8.0
BREAK_DURATION_HOURS = 0.5
OFF_DUTY_RESET_HOURS = 10.0
MAX_CYCLE_HOURS = 70.0
RESTART_HOURS = 34.0
FUEL_STOP_INTERVAL_MILES = 1000.0
FUEL_STOP_DURATION_HOURS = 0.5
PICKUP_DURATION_HOURS = 1.0
DROPOFF_DURATION_HOURS = 1.0
DEFAULT_START_HOUR = 6.0


@dataclass
class DutySegment:
    status: str
    start_dt: datetime
    end_dt: datetime
    location: str

    @property
    def duration_hours(self) -> float:
        return (self.end_dt - self.start_dt).total_seconds() / 3600.0

    @property
    def start_str(self) -> str:
        return self.start_dt.strftime('%H:%M')

    @property
    def end_str(self) -> str:
        if self.end_dt.hour == 0 and self.end_dt.minute == 0 and self.end_dt > self.start_dt:
            return '24:00'
        return self.end_dt.strftime('%H:%M')

    def is_on_duty(self) -> bool:
        return self.status in ('driving', 'on_duty_not_driving')


class HOSCalculator:

    def __init__(self, segments, current_cycle_used_hours, trip_start_datetime):
        self.segments = segments
        self.current_cycle_used_hours = min(current_cycle_used_hours, MAX_CYCLE_HOURS)
        self.trip_start_datetime = trip_start_datetime

        self._all_segments = []
        self._current_time = trip_start_datetime
        self._hours_driven_this_shift = 0.0
        self._hours_since_last_break = 0.0
        self._window_start_time = None
        self._cycle_hours_used = self.current_cycle_used_hours
        self._miles_since_last_fuel = 0.0
        self._total_miles_driven = 0.0
        self._current_physical_location = ""
        self._origin_location = ""

    def calculate(self):
        if not self.segments:
            return []

        self._window_start_time = self._current_time
        self._current_physical_location = self.segments[0][1]
        self._origin_location = self.segments[0][1]

        for seg_idx, (distance_miles, from_loc, to_loc) in enumerate(self.segments):
            is_first_leg = (seg_idx == 0)
            is_last_leg = (seg_idx == len(self.segments) - 1)

            if is_first_leg:
                self._add_duty_event(
                    status='on_duty_not_driving',
                    duration_hours=PICKUP_DURATION_HOURS,
                    location=f"{from_loc} — Pickup",
                    is_on_duty_not_driving=True,
                )

            self._drive_segment(distance_miles, from_loc, to_loc)

            if is_last_leg:
                self._add_duty_event(
                    status='on_duty_not_driving',
                    duration_hours=DROPOFF_DURATION_HOURS,
                    location=f"{to_loc} — Dropoff",
                    is_on_duty_not_driving=True,
                )

        self._finalize_last_day()
        return self._build_day_logs()

    def _drive_segment(self, distance_miles, from_loc, to_loc):
        miles_remaining = distance_miles
        en_route_label = f"En Route: {from_loc} → {to_loc}"

        while miles_remaining > 0:
            # Rule 3: 30-min break after 8 cumulative driving hours
            if self._hours_since_last_break >= BREAK_REQUIRED_AFTER_HOURS:
                self._insert_break(self._current_physical_location)

            # Rule 4: 70-hour cycle limit
            if self._cycle_hours_used >= MAX_CYCLE_HOURS:
                self._insert_34hr_restart(self._current_physical_location)

            time_until_11hr = MAX_DRIVING_HOURS - self._hours_driven_this_shift
            time_until_14hr = self._time_remaining_in_window()
            time_until_break = BREAK_REQUIRED_AFTER_HOURS - self._hours_since_last_break
            time_until_cycle = MAX_CYCLE_HOURS - self._cycle_hours_used
            miles_until_fuel = FUEL_STOP_INTERVAL_MILES - self._miles_since_last_fuel

            available_drive_time = min(
                time_until_11hr,
                time_until_14hr,
                time_until_break,
                time_until_cycle,
            )

            if available_drive_time <= 0:
                if self._hours_driven_this_shift >= MAX_DRIVING_HOURS - 0.001:
                    self._insert_10hr_rest(self._current_physical_location)
                elif self._time_remaining_in_window() <= 0:
                    self._insert_10hr_rest(self._current_physical_location)
                elif self._cycle_hours_used >= MAX_CYCLE_HOURS:
                    self._insert_34hr_restart(self._current_physical_location)
                else:
                    self._insert_break(self._current_physical_location)
                continue

            max_drivable_miles = available_drive_time * AVERAGE_SPEED_MPH

            # Fuel stop within drivable range?
            if miles_until_fuel <= min(miles_remaining, max_drivable_miles):
                if miles_until_fuel > 0.01:
                    drive_hours = miles_until_fuel / AVERAGE_SPEED_MPH
                    self._record_driving(drive_hours, miles_until_fuel, en_route_label)
                    miles_remaining -= miles_until_fuel
                self._add_duty_event(
                    status='on_duty_not_driving',
                    duration_hours=FUEL_STOP_DURATION_HOURS,
                    location=f"Fuel Stop — {self._current_physical_location}",
                    is_on_duty_not_driving=True,
                )
                self._miles_since_last_fuel = 0.0
                continue

            drive_miles = min(miles_remaining, max_drivable_miles)
            drive_hours = drive_miles / AVERAGE_SPEED_MPH

            if drive_hours <= 0:
                self._insert_10hr_rest(self._current_physical_location)
                continue

            self._record_driving(drive_hours, drive_miles, en_route_label)
            miles_remaining -= drive_miles

            if miles_remaining > 0:
                if self._hours_driven_this_shift >= MAX_DRIVING_HOURS - 0.001:
                    self._insert_10hr_rest(self._current_physical_location)
                elif self._time_remaining_in_window() <= 0.001:
                    self._insert_10hr_rest(self._current_physical_location)
                elif self._hours_since_last_break >= BREAK_REQUIRED_AFTER_HOURS - 0.001:
                    self._insert_break(self._current_physical_location)

        self._current_physical_location = to_loc

    def _record_driving(self, drive_hours, drive_miles, location):
        self._add_duty_event(status='driving', duration_hours=drive_hours, location=location)
        self._hours_driven_this_shift += drive_hours
        self._hours_since_last_break += drive_hours
        self._cycle_hours_used += drive_hours
        self._miles_since_last_fuel += drive_miles
        self._total_miles_driven += drive_miles

    def _insert_break(self, location):
        self._add_duty_event(
            status='off_duty',
            duration_hours=BREAK_DURATION_HOURS,
            location=f"{location} — 30-Min Break",
        )
        self._hours_since_last_break = 0.0

    def _insert_10hr_rest(self, location):
        self._add_duty_event(
            status='off_duty',
            duration_hours=OFF_DUTY_RESET_HOURS,
            location=f"{location} — 10-Hr Rest",
        )
        self._hours_driven_this_shift = 0.0
        self._hours_since_last_break = 0.0
        self._window_start_time = self._current_time

    def _insert_34hr_restart(self, location):
        self._add_duty_event(
            status='off_duty',
            duration_hours=RESTART_HOURS,
            location=f"{location} — 34-Hr Restart",
        )
        self._cycle_hours_used = 0.0
        self._hours_driven_this_shift = 0.0
        self._hours_since_last_break = 0.0
        self._window_start_time = self._current_time

    def _add_duty_event(self, status, duration_hours, location, is_on_duty_not_driving=False):
        if duration_hours <= 0:
            return
        end_time = self._current_time + timedelta(hours=duration_hours)
        self._all_segments.append(DutySegment(
            status=status,
            start_dt=self._current_time,
            end_dt=end_time,
            location=location,
        ))
        self._current_time = end_time
        if is_on_duty_not_driving:
            self._cycle_hours_used += duration_hours

    def _time_remaining_in_window(self):
        if self._window_start_time is None:
            return MAX_WINDOW_HOURS
        elapsed = (self._current_time - self._window_start_time).total_seconds() / 3600.0
        return max(0.0, MAX_WINDOW_HOURS - elapsed)

    def _finalize_last_day(self):
        if not self._all_segments:
            return
        last_seg = self._all_segments[-1]
        last_end = last_seg.end_dt
        day_end = datetime(last_end.year, last_end.month, last_end.day) + timedelta(days=1)
        remaining = (day_end - last_end).total_seconds() / 3600.0
        if remaining > 0.001:
            self._add_duty_event(
                status='off_duty',
                duration_hours=remaining,
                location=self._current_physical_location,
            )

    def _clean_loc(self, loc):
        for suffix in [' — Pickup', ' — Dropoff', ' — 10-Hr Rest',
                       ' — 34-Hr Restart', ' — 30-Min Break']:
            if suffix in loc:
                return loc.split(suffix)[0].strip()
        if 'Fuel Stop — ' in loc:
            return loc.replace('Fuel Stop — ', '').strip()
        if 'En Route:' in loc:
            parts = loc.replace('En Route: ', '').split(' → ')
            return parts[0].strip()
        return loc

    def _build_day_logs(self):
        if not self._all_segments:
            return []

        first_dt = self._all_segments[0].start_dt
        last_dt = self._all_segments[-1].end_dt

        dates = []
        current_date = first_dt.date()
        end_date = last_dt.date()
        while current_date <= end_date:
            dates.append(current_date)
            current_date += timedelta(days=1)

        day_logs = []
        cumulative_cycle_hours = self.current_cycle_used_hours
        day_number = 1

        for date in dates:
            day_start = datetime(date.year, date.month, date.day, 0, 0, 0)
            day_end = day_start + timedelta(days=1)

            day_segments = []
            day_driving_hours = 0.0
            day_on_duty_hours = 0.0

            for seg in self._all_segments:
                if seg.end_dt <= day_start or seg.start_dt >= day_end:
                    continue
                clipped_start = max(seg.start_dt, day_start)
                clipped_end = min(seg.end_dt, day_end)
                if clipped_end <= clipped_start:
                    continue
                clipped_seg = DutySegment(
                    status=seg.status,
                    start_dt=clipped_start,
                    end_dt=clipped_end,
                    location=seg.location,
                )
                day_segments.append(clipped_seg)
                dur = (clipped_end - clipped_start).total_seconds() / 3600.0
                if seg.status == 'driving':
                    day_driving_hours += dur
                    day_on_duty_hours += dur
                elif seg.status == 'on_duty_not_driving':
                    day_on_duty_hours += dur

            if not day_segments:
                continue

            day_segments = self._fill_gaps(day_segments, day_start, day_end)

            total_hours = {'off_duty': 0.0, 'sleeper_berth': 0.0, 'driving': 0.0, 'on_duty_not_driving': 0.0}
            for seg in day_segments:
                total_hours[seg.status] = round(total_hours[seg.status] + seg.duration_hours, 6)
            for k in total_hours:
                total_hours[k] = round(total_hours[k], 2)

            day_miles = round(day_driving_hours * AVERAGE_SPEED_MPH, 1)
            from_loc, to_loc = self._get_day_locations(day_segments)
            cumulative_cycle_hours = min(cumulative_cycle_hours + day_on_duty_hours, MAX_CYCLE_HOURS)
            remarks = self._build_remarks(day_segments)

            segment_dicts = []
            for seg in day_segments:
                end_str = seg.end_str
                if seg.end_dt.date() > date and seg.end_dt.time() == datetime.min.time():
                    end_str = '24:00'
                segment_dicts.append({
                    'status': seg.status,
                    'start': seg.start_str,
                    'end': end_str,
                    'location': seg.location,
                    'duration_hours': round(seg.duration_hours, 2),
                })

            day_logs.append({
                'day': day_number,
                'date': date.strftime('%Y-%m-%d'),
                'from_location': from_loc,
                'to_location': to_loc,
                'total_miles_today': day_miles,
                'segments': segment_dicts,
                'total_hours': total_hours,
                'remarks': remarks,
                'cycle_hours_at_end_of_day': round(cumulative_cycle_hours, 2),
            })

            day_number += 1

        return day_logs

    def _fill_gaps(self, segments, day_start, day_end):
        if not segments:
            return []

        filled = []

        if segments[0].start_dt > day_start:
            filled.append(DutySegment(
                status='off_duty',
                start_dt=day_start,
                end_dt=segments[0].start_dt,
                location=self._clean_loc(segments[0].location),
            ))

        for i, seg in enumerate(segments):
            filled.append(seg)
            if i + 1 < len(segments):
                next_seg = segments[i + 1]
                if seg.end_dt < next_seg.start_dt:
                    filled.append(DutySegment(
                        status='off_duty',
                        start_dt=seg.end_dt,
                        end_dt=next_seg.start_dt,
                        location=self._clean_loc(seg.location),
                    ))

        if filled and filled[-1].end_dt < day_end:
            filled.append(DutySegment(
                status='off_duty',
                start_dt=filled[-1].end_dt,
                end_dt=day_end,
                location=self._clean_loc(filled[-1].location),
            ))

        return self._merge_consecutive(filled)

    def _merge_consecutive(self, segments):
        if not segments:
            return []
        merged = [segments[0]]
        for seg in segments[1:]:
            last = merged[-1]
            if (last.status == seg.status and
                    abs((seg.start_dt - last.end_dt).total_seconds()) < 1):
                merged[-1] = DutySegment(
                    status=last.status,
                    start_dt=last.start_dt,
                    end_dt=seg.end_dt,
                    location=last.location,
                )
            else:
                merged.append(seg)
        return merged

    def _get_day_locations(self, segments):
        from_loc = self._origin_location or "En Route"
        to_loc = "En Route"

        for seg in segments:
            if seg.status in ('driving', 'on_duty_not_driving'):
                loc = seg.location
                if 'En Route:' in loc:
                    parts = loc.replace('En Route: ', '').split(' → ')
                    if parts:
                        from_loc = parts[0].strip()
                    if len(parts) > 1:
                        to_loc = parts[1].strip()
                elif '— Pickup' in loc:
                    from_loc = loc.replace(' — Pickup', '').strip()
                elif '—' in loc:
                    from_loc = loc.split('—')[0].strip()
                else:
                    from_loc = loc
                break

        for seg in reversed(segments):
            if seg.status in ('driving', 'on_duty_not_driving'):
                loc = seg.location
                if 'En Route:' in loc:
                    parts = loc.replace('En Route: ', '').split(' → ')
                    if len(parts) > 1:
                        to_loc = parts[-1].strip()
                elif '— Dropoff' in loc:
                    to_loc = loc.replace(' — Dropoff', '').strip()
                elif '—' in loc:
                    to_loc = loc.split('—')[0].strip()
                break

        return from_loc, to_loc

    def _build_remarks(self, segments):
        remarks = []
        status_labels = {
            'off_duty': 'Off Duty',
            'sleeper_berth': 'Sleeper Berth',
            'driving': 'Driving',
            'on_duty_not_driving': 'On Duty (Not Driving)',
        }
        prev_status = None
        for seg in segments:
            if seg.status != prev_status:
                label = status_labels.get(seg.status, seg.status)
                remarks.append(f"{seg.start_str} - {label} - {seg.location}")
                prev_status = seg.status
        return remarks
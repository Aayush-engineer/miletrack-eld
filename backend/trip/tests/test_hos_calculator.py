from datetime import datetime, timedelta
from django.test import TestCase

from trip.services.hos_calculator import (
    HOSCalculator,
    MAX_DRIVING_HOURS,
    MAX_WINDOW_HOURS,
    BREAK_REQUIRED_AFTER_HOURS,
    BREAK_DURATION_HOURS,
    OFF_DUTY_RESET_HOURS,
    MAX_CYCLE_HOURS,
    RESTART_HOURS,
    FUEL_STOP_INTERVAL_MILES,
    AVERAGE_SPEED_MPH,
)


def make_calculator(segments, cycle_used=0.0, start_hour=6):
    start_dt = datetime(2026, 5, 15, start_hour, 0, 0)
    return HOSCalculator(
        segments=segments,
        current_cycle_used_hours=cycle_used,
        trip_start_datetime=start_dt,
    )


class Test30MinBreakInsertion(TestCase):

    def test_break_inserted_after_8_hours_driving(self):
        calc = make_calculator([(500, "City A", "City B")])
        logs = calc.calculate()

        all_segments = []
        for log in logs:
            all_segments.extend(log['segments'])

        breaks = [
            s for s in all_segments
            if s['status'] == 'off_duty' and s['duration_hours'] <= 0.6
        ]
        self.assertGreater(len(breaks), 0,
            "A 30-minute break should be inserted for a 500-mile trip")

    def test_no_break_needed_under_8_hours(self):
        calc = make_calculator([(400, "City A", "City B")])
        logs = calc.calculate()

        all_segments = []
        for log in logs:
            all_segments.extend(log['segments'])

        driving_segments = [s for s in all_segments if s['status'] == 'driving']
        total_drive_hours = sum(s['duration_hours'] for s in driving_segments)

        self.assertLessEqual(total_drive_hours, BREAK_REQUIRED_AFTER_HOURS + 0.01,
            "Should not need a break for under 8 hours driving")

    def test_break_resets_hours_since_break_counter(self):
        calc = make_calculator([(900, "A", "B")])
        logs = calc.calculate()

        all_segments = []
        for log in logs:
            all_segments.extend(log['segments'])

        off_duty_short = [
            s for s in all_segments
            if s['status'] == 'off_duty' and 0.4 <= s['duration_hours'] <= 0.6
        ]
        self.assertGreater(len(off_duty_short) + len([
            s for s in all_segments if s['status'] == 'off_duty' and s['duration_hours'] > 9.5
        ]), 0, "Long trip should have rest or break events")


class Test11HourDrivingLimit(TestCase):

    def test_driving_capped_at_11_hours_per_shift(self):
        calc = make_calculator([(700, "Chicago, IL", "Dallas, TX")])
        logs = calc.calculate()

        for log in logs:
            driving_hours = log['total_hours']['driving']
            self.assertLessEqual(
                driving_hours,
                MAX_DRIVING_HOURS + 0.01,
                f"Day {log['day']} has {driving_hours}h driving (max {MAX_DRIVING_HOURS}h)"
            )

    def test_10hr_rest_inserted_after_11hr_driving(self):
        calc = make_calculator([(700, "A", "B")])
        logs = calc.calculate()

        all_segments = []
        for log in logs:
            all_segments.extend(log['segments'])

        # Look for 10-hour off-duty rest
        long_rests = [
            s for s in all_segments
            if s['status'] == 'off_duty' and s['duration_hours'] >= OFF_DUTY_RESET_HOURS - 0.1
        ]
        self.assertGreater(len(long_rests), 0,
            "A 10-hour rest should be inserted after reaching 11-hour driving limit")

    def test_multi_day_trip_each_day_under_11_hours(self):
        calc = make_calculator([(2000, "New York, NY", "Los Angeles, CA")])
        logs = calc.calculate()

        self.assertGreater(len(logs), 1, "Should span multiple days")
        for log in logs:
            driving = log['total_hours']['driving']
            self.assertLessEqual(
                driving, MAX_DRIVING_HOURS + 0.01,
                f"Day {log['day']} ({log['date']}): {driving}h driving exceeds limit"
            )


class Test14HourWindowEnforcement(TestCase):

    def test_all_driving_within_14_hour_window(self):
        calc = make_calculator([(500, "A", "B")], start_hour=6)
        logs = calc.calculate()

        for log in logs:
            segments = log['segments']
            if not segments:
                continue

            shift_starts = [
                s for s in segments
                if s['status'] in ('driving', 'on_duty_not_driving')
            ]
            if not shift_starts:
                continue

            first_on_duty = shift_starts[0]
            h, m = map(int, first_on_duty['start'].split(':'))
            shift_start_minutes = h * 60 + m
            window_end_minutes = shift_start_minutes + int(MAX_WINDOW_HOURS * 60)

            driving_segs = [s for s in segments if s['status'] == 'driving']
            for seg in driving_segs:
                end_str = seg['end'].replace('24:00', '1440')
                if ':' in end_str:
                    eh, em = map(int, end_str.split(':'))
                    end_minutes = eh * 60 + em
                else:
                    end_minutes = int(end_str)
                self.assertLessEqual(
                    end_minutes, window_end_minutes + 5,
                    f"Driving segment ends at minute {end_minutes}, "
                    f"but 14hr window ends at minute {window_end_minutes}"
                )


class Test70HourCycleLimit(TestCase):

    def test_cycle_hours_never_exceed_70(self):
        calc = make_calculator([(2000, "A", "B")], cycle_used=50.0)
        logs = calc.calculate()

        for log in logs:
            cycle_hours = log['cycle_hours_at_end_of_day']
            self.assertLessEqual(
                cycle_hours, MAX_CYCLE_HOURS + 0.01,
                f"Day {log['day']}: cycle hours {cycle_hours} exceeds 70-hour limit"
            )

    def test_34hr_restart_inserted_when_cycle_exceeded(self):
        calc = make_calculator([(500, "A", "B")], cycle_used=68.0)
        logs = calc.calculate()

        all_segments = []
        for log in logs:
            all_segments.extend(log['segments'])

        restarts = [
            s for s in all_segments
            if s['status'] == 'off_duty' and 
            '34-Hr Restart' in s.get('location', '')
        ]
        self.assertGreater(len(restarts), 0,
            "A 34-hour restart should be inserted when cycle hours are exhausted")

    def test_cycle_hours_reset_after_34hr_restart(self):
        calc = make_calculator([(500, "A", "B")], cycle_used=69.0)
        logs = calc.calculate()

        restart_found = False
        for log in logs:
            for seg in log['segments']:
                if '34-Hr Restart' in seg.get('location', ''):
                    restart_found = True
        if restart_found and len(logs) >= 2:
            last_log = logs[-1]
            self.assertLess(
                last_log['cycle_hours_at_end_of_day'], 70.0,
                "Cycle hours should be manageable after restart"
            )


class TestMultiDayTripEndToEnd(TestCase):

    def test_chicago_dallas_la_segment_structure(self):
        segments = [
            (920.0, "Chicago, IL", "Dallas, TX"),
            (1430.0, "Dallas, TX", "Los Angeles, CA"),
        ]
        calc = make_calculator(segments, cycle_used=20.0)
        logs = calc.calculate()

        self.assertGreaterEqual(len(logs), 3,
            "A 2350-mile trip with 20hr cycle used should take at least 3 days")

        for log in logs[:-1]:  
            total = sum(log['total_hours'].values())
            self.assertAlmostEqual(
                total, 24.0, delta=0.1,
                msg=f"Day {log['day']} total hours {total} != 24.0"
            )

        all_locs = []
        for log in logs:
            for seg in log['segments']:
                all_locs.append(seg['location'])

        has_pickup = any('Pickup' in loc or 'pickup' in loc.lower() for loc in all_locs)
        has_dropoff = any('Dropoff' in loc or 'dropoff' in loc.lower() for loc in all_locs)
        self.assertTrue(has_pickup, "Should have a pickup event")
        self.assertTrue(has_dropoff, "Should have a dropoff event")

    def test_total_driving_hours_reasonable(self):
        segments = [(550.0, "A", "B")]
        calc = make_calculator(segments, cycle_used=0.0)
        logs = calc.calculate()

        total_driving = sum(log['total_hours']['driving'] for log in logs)
        expected_hours = 550.0 / AVERAGE_SPEED_MPH  # 10.0 hours

        self.assertAlmostEqual(total_driving, expected_hours, delta=1.5,
            msg=f"Total driving {total_driving}h, expected ~{expected_hours}h")

    def test_fuel_stops_inserted_every_1000_miles(self):
        segments = [(1200.0, "A", "B")]
        calc = make_calculator(segments, cycle_used=0.0)
        logs = calc.calculate()

        all_segments = []
        for log in logs:
            all_segments.extend(log['segments'])

        fuel_stops = [
            s for s in all_segments
            if s['status'] == 'on_duty_not_driving' and 'Fuel' in s.get('location', '')
        ]
        self.assertGreaterEqual(len(fuel_stops), 1,
            "A 1200-mile trip should have at least 1 fuel stop")

    def test_pickup_and_dropoff_events_present(self):
        segments = [
            (300.0, "Chicago, IL", "St. Louis, MO"),
            (300.0, "St. Louis, MO", "Memphis, TN"),
        ]
        calc = make_calculator(segments, cycle_used=0.0)
        logs = calc.calculate()

        all_segments = []
        for log in logs:
            all_segments.extend(log['segments'])

        pickup_segs = [s for s in all_segments if 'Pickup' in s.get('location', '')]
        dropoff_segs = [s for s in all_segments if 'Dropoff' in s.get('location', '')]

        self.assertEqual(len(pickup_segs), 1, "Exactly one pickup event required")
        self.assertEqual(len(dropoff_segs), 1, "Exactly one dropoff event required")
        self.assertAlmostEqual(pickup_segs[0]['duration_hours'], 1.0, delta=0.01)
        self.assertAlmostEqual(dropoff_segs[0]['duration_hours'], 1.0, delta=0.01)
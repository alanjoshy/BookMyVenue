from datetime import date, datetime, time, timedelta
from typing import Any


MAX_BOOKING_DAYS = 30


def combine_dt(d: date, t: time) -> datetime:
    return datetime.combine(d, t)


def booking_start_dt(booking: Any) -> datetime:
    return combine_dt(booking.check_in_date, booking.check_in_time)


def booking_end_dt(booking: Any) -> datetime:
    return combine_dt(booking.check_out_date, booking.check_out_time)


def intervals_overlap(
    a_start: datetime,
    a_end: datetime,
    b_start: datetime,
    b_end: datetime,
) -> bool:
    return a_start < b_end and b_start < a_end


def dates_overlap(
    a_start: date,
    a_end: date,
    b_start: date,
    b_end: date,
) -> bool:
    """True when two inclusive calendar-date ranges share any day."""
    return a_start <= b_end and b_start <= a_end


def is_blocking_booking(booking: Any) -> bool:
    """
    Bookings that still hold venue dates:
    - awaiting owner approval (pending_payment + pending)
    - accepted, waiting for payment
    - paid / confirmed (booked)
    Rejected, cancelled, and completed bookings free the dates again.
    """
    if getattr(booking, "owner_status", None) == "rejected":
        return False
    status = getattr(booking, "status", None)
    if status in ("cancelled", "completed"):
        return False
    return True


def count_days(check_in_date: date, check_out_date: date) -> int:
    return (check_out_date - check_in_date).days + 1


def day_in_booking_range(booking: Any, day: date) -> bool:
    return booking.check_in_date <= day <= booking.check_out_date


def format_period(booking: Any) -> str:
    start = booking_start_dt(booking)
    end = booking_end_dt(booking)
    days = booking.num_days if booking.num_days is not None else count_days(
        booking.check_in_date, booking.check_out_date
    )
    return (
        f"{start.strftime('%d %b %Y %I:%M %p')} → "
        f"{end.strftime('%d %b %Y %I:%M %p')} ({days} days)"
    )


def iter_dates_in_range(start: date, end: date):
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)

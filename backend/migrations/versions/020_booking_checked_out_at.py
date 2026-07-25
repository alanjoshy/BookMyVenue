"""add booking checked_out_at for manual/test checkout

Revision ID: 020_booking_checked_out_at
Revises: 019_repair_payment_type
Create Date: 2026-07-26

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "020_booking_checked_out_at"
down_revision: Union[str, None] = "019_repair_payment_type"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = {c["name"] for c in inspector.get_columns("bookings")}
    if "checked_out_at" not in columns:
        op.add_column(
            "bookings",
            sa.Column("checked_out_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = {c["name"] for c in inspector.get_columns("bookings")}
    if "checked_out_at" in columns:
        op.drop_column("bookings", "checked_out_at")

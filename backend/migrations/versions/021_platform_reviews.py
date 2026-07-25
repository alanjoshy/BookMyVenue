"""add platform reviews

Revision ID: 021_platform_reviews
Revises: 020_booking_checked_out_at
Create Date: 2026-07-26
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "021_platform_reviews"
down_revision: Union[str, None] = "020_booking_checked_out_at"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = inspect(op.get_bind())
    if "platform_reviews" in inspector.get_table_names():
        return

    op.create_table(
        "platform_reviews",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("booking_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "rating >= 1 AND rating <= 5",
            name="ck_platform_review_rating_range",
        ),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("booking_id", name="uq_platform_review_booking_id"),
    )
    op.create_index(
        op.f("ix_platform_reviews_id"),
        "platform_reviews",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    inspector = inspect(op.get_bind())
    if "platform_reviews" not in inspector.get_table_names():
        return
    op.drop_index(op.f("ix_platform_reviews_id"), table_name="platform_reviews")
    op.drop_table("platform_reviews")

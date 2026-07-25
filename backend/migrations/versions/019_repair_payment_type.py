"""repair missing payments.payment_type column

Revision ID: 019_repair_payment_type
Revises: debf2b2c5d28
Create Date: 2026-07-25

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "019_repair_payment_type"
down_revision: Union[str, None] = "debf2b2c5d28"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    payment_columns = {
        column["name"] for column in inspect(bind).get_columns("payments")
    }

    if "payment_type" not in payment_columns:
        op.add_column(
            "payments",
            sa.Column(
                "payment_type",
                sa.String(length=20),
                nullable=False,
                server_default="full",
            ),
        )

    op.execute(
        """
        DO $$ BEGIN
            ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payment_type;
            ALTER TABLE payments ADD CONSTRAINT ck_payment_type
                CHECK (payment_type IN ('full', 'advance', 'balance', 'pay_at_venue'));
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
        """
    )


def downgrade() -> None:
    bind = op.get_bind()
    payment_columns = {
        column["name"] for column in inspect(bind).get_columns("payments")
    }
    if "payment_type" in payment_columns:
        op.execute("ALTER TABLE payments DROP CONSTRAINT IF EXISTS ck_payment_type")
        op.drop_column("payments", "payment_type")

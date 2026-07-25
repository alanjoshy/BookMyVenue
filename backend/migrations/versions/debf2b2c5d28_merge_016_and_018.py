"""merge_016_and_018

Revision ID: debf2b2c5d28
Revises: 016_payment_options, 018_venue_google_review_url
Create Date: 2026-07-25 14:30:28.286203

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'debf2b2c5d28'
down_revision: Union[str, None] = ('016_payment_options', '018_venue_google_review_url')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

# import every model here so SQLAlchemy knows all tables and relationships
# without this the venue relationship breaks and the server will not run
from app.models import user
from app.models import venue
from app.models import amenity
from app.models import venue_amenity
from app.models import booking
from app.models import payment

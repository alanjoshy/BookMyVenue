<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchPublicVenuesAsync } from "../modules/venues/venuesSlice";
import { reviewService } from "../modules/reviews/services/reviewService";
import { logoutUserAsync } from "../modules/auth/authSlice";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";



function StarIcon({ filled = true, className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function MapPinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function UsersIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}


function FeaturedVenueCard({ venue }) {
  return (
    <Link
      to={`/venues/${venue.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:border-rose-100 transition-all duration-300"
    >
      <div className="relative overflow-hidden">
        {venue.image_url ? (
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-52 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <span className="text-slate-400 text-sm">No image</span>
          </div>
        )}
        {venue.average_rating && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            <StarIcon className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-slate-800">
              {Number(venue.average_rating).toFixed(1)}
            </span>
          </div>
        )}
        {venue.venue_type && (
          <div className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-semibold px-2 py-1 rounded-lg uppercase tracking-wide">
            {venue.venue_type.name}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-base leading-tight">{venue.name}</h3>
        <div className="flex items-center gap-1 mt-1.5 text-slate-400">
          <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs truncate">{venue.location}</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <div>
            <span className="text-lg font-bold text-slate-900">
              ₹{Number(venue.price_per_day).toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-slate-400"> /day</span>
          </div>
          {venue.capacity && (
            <div className="flex items-center gap-1 text-slate-400">
              <UsersIcon className="w-3.5 h-3.5" />
              <span className="text-xs">{venue.capacity} guests</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function StarRating({ rating, className = "" }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon
          key={i}
          filled={i <= rating}
          className={`w-4 h-4 ${i <= rating ? "text-amber-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const initials = review.reviewer_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4">
      <StarRating rating={review.rating} />
      <p className="text-slate-600 text-sm leading-relaxed italic">
        "{review.comment}"
      </p>
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-50">
        <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{review.reviewer_name}</p>
          <p className="text-xs text-slate-400">
            {review.event_type ? `${review.event_type} · ` : ""}
            {review.venue_name}
          </p>
        </div>
      </div>
    </div>
  );
}

=======
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import heroImage from "../assets/hero.png";

const STEPS = [
  {
    step: "1",
    title: "Browse venues",
    text: "Search approved venues by name, location, and type.",
  },
  {
    step: "2",
    title: "Book your slot",
    text: "Pick a date and time, check availability, and reserve instantly.",
  },
  {
    step: "3",
    title: "Pay & track",
    text: "Complete checkout and follow your order from one place.",
  },
];
>>>>>>> 7397f30aa734e466506d74299979af83f7cd2b3a

const STATS = [
  { value: "10,000+", label: "Happy customers" },
  { value: "2,500+", label: "Venues listed" },
  { value: "15,000+", label: "Bookings completed" },
];

const CUSTOMER_FEATURES = [
  "Search and filter venues by location",
  "Real-time slot availability",
  "Secure checkout and payments",
  "Order history and profile management",
];

const OWNER_FEATURES = [
  "List and manage your venues",
  "Accept or reject booking requests",
  "Owner dashboard with booking overview",
  "Revenue and calendar insights",
];

<<<<<<< HEAD

=======
>>>>>>> 7397f30aa734e466506d74299979af83f7cd2b3a
function LandingPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isOwner = user?.is_venue_owner;
  const isAdmin = user?.role === "admin";

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col font-sans">
      <Navbar activePage="home" />

      <main className="flex-1">
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-rose-700 rounded-full blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs text-rose-200 mb-6">
              <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
              YOUR PERFECT VENUE AWAITS
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl mx-auto">
              Find The Perfect<br />
              <span className="text-rose-400">Venue</span> For Every Celebration
            </h1>
            <p className="text-slate-300 mt-5 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Wedding, Birthday, Corporate Events and more.<br />
              Explore the best venues near you.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link
                to="/venues"
                className="bg-rose-600 hover:bg-rose-700 text-white px-7 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-rose-900/50 flex items-center gap-2"
              >
                Search Venues <ArrowRightIcon />
              </Link>
              <button
                onClick={handleListVenue}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-7 py-3 rounded-xl font-medium transition-colors"
              >
                List Your Venue
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 -mt-6 relative z-10">
          <div className="bg-rose-700 rounded-2xl shadow-xl shadow-rose-900/20 grid grid-cols-2 md:grid-cols-4 divide-x divide-rose-600">
            {STATS.map((stat) => (
              <div key={stat.label} className="px-6 py-5 text-center text-white">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-rose-200 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-16 pb-12">
          <div className="flex items-end justify-between mb-8">
=======
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-200">
              BMV
            </div>
            <span className="font-bold text-slate-800 hidden sm:inline">BookMyVenue</span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-5 text-sm">
            <Link to="/venues" className="text-slate-600 hover:text-blue-600">
              Browse venues
            </Link>
            {isAuthenticated ? (
              <>
                {isOwner && (
                  <Link
                    to="/owner/dashboard"
                    className="text-slate-600 hover:text-blue-600 hidden sm:inline"
                  >
                    Owner dashboard
                  </Link>
                )}
                {!isOwner && user?.role === "user" && (
                  <Link to="/dashboard" className="text-slate-600 hover:text-blue-600">
                    Go to dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="text-slate-600 hover:text-blue-600">
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-blue-600">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
>>>>>>> 7397f30aa734e466506d74299979af83f7cd2b3a
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-3">
                Venue booking made simple
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight">
                Find and book the perfect venue for every occasion
              </h1>
              <p className="text-slate-500 mt-4 text-base md:text-lg max-w-lg leading-relaxed">
                Weddings, corporate events, parties, and celebrations — discover approved
                venues, book your date, and manage everything in one place.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  to="/venues"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg shadow-blue-200 transition-colors"
                >
                  Browse venues
                </Link>
                <Link
                  to="/register-venue-owner"
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  List your venue
                </Link>
              </div>
            </div>
<<<<<<< HEAD
            <Link
              to="/venues"
              className="flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              View all venues <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoadingList ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                  <div className="w-full h-52 bg-slate-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-4 bg-slate-100 rounded w-1/3 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : venues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {venues.slice(0, 4).map((venue) => (
                <FeaturedVenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm">No venues available yet.</p>
            </div>
          )}
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-800">How It Works</h2>
              <p className="text-sm text-slate-400 mt-2">Four simple steps to your perfect event</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map((item, idx) => (
                <div key={item.title} className="text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-slate-800">{item.title}</h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed max-w-[180px] mx-auto">{item.text}</p>
                </div>
              ))}
=======
            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white p-2">
              <img
                src={heroImage}
                alt="Event venue"
                className="w-full h-64 md:h-80 object-cover rounded-xl"
              />
>>>>>>> 7397f30aa734e466506d74299979af83f7cd2b3a
            </div>
          </div>
        </section>

<<<<<<< HEAD
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800">Why Choose BookMyVenue?</h2>
            <p className="text-sm text-slate-400 mt-2">
              Providing more than just a space, we provide peace of mind for your most important moments.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_FEATURES.map((feat) => (
=======
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STATS.map((stat) => (
>>>>>>> 7397f30aa734e466506d74299979af83f7cd2b3a
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-slate-100 p-5 text-center"
              >
                <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

<<<<<<< HEAD
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-800">What Our Customers Say</h2>
              <div className="flex justify-center items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} className="w-4 h-4 text-amber-400" />
                ))}
=======
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">How it works</h2>
            <p className="text-sm text-slate-400 mt-2">Three steps from search to celebration</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl border border-slate-100 p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-800">{item.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{item.text}</p>
>>>>>>> 7397f30aa734e466506d74299979af83f7cd2b3a
              </div>
            ))}
          </div>
        </section>

<<<<<<< HEAD
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="relative bg-gradient-to-br from-slate-900 to-rose-950 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500 rounded-full blur-3xl" />
            </div>
            <div className="relative px-8 md:px-12 py-12 md:py-16 max-w-lg">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Own a Venue?
              </h2>
              <p className="text-rose-200 mt-3 text-sm leading-relaxed">
                List it with BookMyVenue and reach thousands of customers every day. Join our community of premium venue partners.
=======
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Get started</h2>
            <p className="text-sm text-slate-400 mt-2">Choose how you want to use BookMyVenue</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-8 hover:shadow-md hover:border-blue-100 transition-all">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">For customers</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Book venues for your events, manage orders, and keep your profile up to date.
>>>>>>> 7397f30aa734e466506d74299979af83f7cd2b3a
              </p>
              <ul className="mt-4 space-y-2">
                {CUSTOMER_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 mt-6">
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="border border-slate-200 hover:border-blue-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium"
                >
                  Create account
                </Link>
                <Link to="/venues" className="text-blue-600 hover:underline text-sm py-2">
                  Browse without account →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-8 hover:shadow-md hover:border-blue-100 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">For venue owners</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                List your space, handle booking requests, and grow your business on our platform.
              </p>
              <ul className="mt-4 space-y-2">
                {OWNER_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 mt-6">
                <Link
                  to="/register-venue-owner"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
                >
                  Register as host
                </Link>
                <Link
                  to="/login"
                  className="border border-slate-200 hover:border-blue-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium"
                >
                  Host sign in
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="bg-blue-600 rounded-2xl p-8 md:p-10 text-center text-white shadow-lg shadow-blue-200">
            <h2 className="text-2xl font-bold">Ready to find your venue?</h2>
            <p className="text-blue-100 mt-2 text-sm max-w-md mx-auto">
              Explore hundreds of approved venues or join as a host and start receiving bookings today.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Link
                to="/venues"
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-xl text-sm font-medium"
              >
                Browse venues
              </Link>
              <Link
                to="/register-venue-owner"
                className="border border-white/40 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl text-sm font-medium"
              >
                Become a host
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              BMV
            </div>
            <span className="font-semibold text-slate-700">BookMyVenue</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-5">
            <Link to="/venues" className="hover:text-blue-600">Browse venues</Link>
            <Link to="/register-venue-owner" className="hover:text-blue-600">List your venue</Link>
          </nav>
          <span className="text-slate-400">© {new Date().getFullYear()} BookMyVenue</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

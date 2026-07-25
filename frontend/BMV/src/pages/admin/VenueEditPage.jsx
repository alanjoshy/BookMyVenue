import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminService } from "../../modules/admin/services/adminService";
import {
  AdminFormLayout,
  AdminLoading,
  FormActions,
  FormField,
  ToggleField,
  inputCls,
} from "../../components/admin/AdminForm";
import { StatusBadge } from "../../components/admin/AdminCard";

function VenueEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [owners, setOwners] = useState([]);
  const [venueTypes, setVenueTypes] = useState([]);
  const [form, setForm] = useState({
    name: "",
    location: "",
    price_per_day: "",
    venue_type_id: "",
    owner_id: "",
    capacity: "",
    image_url: "",
    google_maps_url: "",
    google_review_url: "",
    description: "",
    approval_status: "pending",
    rejection_reason: "",
    is_active: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      adminService.getVenue(id),
      adminService.getUsers({ role: "host", limit: 100 }),
      adminService.getVenueTypes(),
    ])
      .then(([v, ownerList, types]) => {
        setVenue(v);
        setOwners(ownerList);
        setVenueTypes(types);
        setForm({
          name: v.name,
          location: v.location,
          price_per_day: v.price_per_day,
          venue_type_id: v.venue_type_id ? String(v.venue_type_id) : "",
          owner_id: String(v.owner_id),
          capacity: v.capacity ?? "",
          image_url: v.image_url || "",
          google_maps_url: v.google_maps_url || "",
          google_review_url: v.google_review_url || "",
          description: v.description || "",
          approval_status: v.approval_status,
          rejection_reason: v.rejection_reason || "",
          is_active: v.is_active,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminService.updateVenue(id, {
        name: form.name,
        location: form.location,
        price_per_day: Number(form.price_per_day),
        venue_type_id: form.venue_type_id ? Number(form.venue_type_id) : null,
        owner_id: form.owner_id ? Number(form.owner_id) : null,
        capacity: form.capacity === "" ? null : Number(form.capacity),
        image_url: form.image_url || null,
        google_maps_url: form.google_maps_url || null,
        google_review_url: form.google_review_url || null,
        description: form.description || null,
        approval_status: form.approval_status,
        rejection_reason:
          form.approval_status === "rejected"
            ? form.rejection_reason.trim() || null
            : null,
        is_active: form.is_active,
      });
      navigate("/admin/venues");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <AdminFormLayout
      title="Edit Venue"
      subtitle={venue ? `ID #${venue.id} · Owner: ${venue.owner_name || "—"}` : ""}
      backTo="/admin/venues"
      backLabel="All venues"
      error={error}
    >
      {venue && (
        <div className="mb-5 space-y-3">
          <div className="flex gap-2">
            <StatusBadge status={venue.approval_status} />
            <StatusBadge status={venue.is_active ? "active" : "inactive"} />
          </div>
          {(venue.images?.length > 0 || venue.image_url) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(venue.images?.length
                ? venue.images.map((img) => img.url)
                : [venue.image_url]
              )
                .filter(Boolean)
                .slice(0, 8)
                .map((url, idx) => (
                  <img
                    key={`${url}-${idx}`}
                    src={url}
                    alt=""
                    className="h-24 w-full object-cover rounded-xl border border-slate-100"
                  />
                ))}
            </div>
          )}
          {venue.amenities?.length > 0 && (
            <p className="text-xs text-slate-500">
              Amenities: {venue.amenities.map((a) => a.name).join(", ")}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Owner (host)">
          <select name="owner_id" value={form.owner_id} onChange={handleChange} className={inputCls} required>
            <option value="">Select owner</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name || o.email} ({o.email})
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Venue name">
            <input name="name" value={form.name} onChange={handleChange} className={inputCls} required />
          </FormField>
          <FormField label="Location">
            <input name="location" value={form.location} onChange={handleChange} className={inputCls} required />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Price per day (INR)">
            <input
              name="price_per_day"
              type="number"
              min="0"
              value={form.price_per_day}
              onChange={handleChange}
              className={inputCls}
              required
            />
          </FormField>
          <FormField label="Venue type">
            <select name="venue_type_id" value={form.venue_type_id} onChange={handleChange} className={inputCls}>
              <option value="">Select type</option>
              {venueTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Capacity">
            <input
              name="capacity"
              type="number"
              min="1"
              value={form.capacity}
              onChange={handleChange}
              className={inputCls}
            />
          </FormField>
          <FormField label="Approval status">
            <select name="approval_status" value={form.approval_status} onChange={handleChange} className={inputCls}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </FormField>
        </div>

        {form.approval_status === "rejected" && (
          <FormField
            label="Rejection reason"
            hint="Shown to help the owner understand what to fix"
          >
            <textarea
              name="rejection_reason"
              value={form.rejection_reason}
              onChange={handleChange}
              className={inputCls}
              rows={3}
              placeholder="Why was this venue rejected?"
            />
          </FormField>
        )}

        <FormField label="Image URL">
          <input name="image_url" value={form.image_url} onChange={handleChange} className={inputCls} />
        </FormField>

        <FormField label="Google Maps URL">
          <input name="google_maps_url" value={form.google_maps_url} onChange={handleChange} className={inputCls} />
        </FormField>

        <FormField label="Google Review URL">
          <input
            name="google_review_url"
            value={form.google_review_url}
            onChange={handleChange}
            className={inputCls}
            placeholder="https://g.page/r/.../review"
          />
        </FormField>

        <FormField label="Description" hint="Optional details shown to customers">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className={inputCls}
            rows={4}
          />
        </FormField>

        <ToggleField
          label="Active on platform"
          hint="Blocked venues are hidden from public listings"
          name="is_active"
          checked={form.is_active}
          onChange={handleChange}
        />

        <FormActions saving={saving} cancelTo="/admin/venues" saveLabel="Save venue" />
      </form>
    </AdminFormLayout>
  );
}

export default VenueEditPage;

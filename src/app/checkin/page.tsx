"use client";

import { useState } from "react";
import { useStore } from "@/lib/store-context";

const brandDeviceMap: Record<string, string[]> = {
  Apple: ["iPhone", "iPad", "MacBook", "iMac", "Mac Mini", "Apple Watch", "AirPods", "Other Apple"],
  Samsung: ["Android Phone", "Android Tablet", "Laptop", "Monitor", "Other Samsung"],
  Google: ["Android Phone", "Android Tablet", "Chromebook", "Other Google"],
  Huawei: ["Android Phone", "Android Tablet", "Laptop", "Other Huawei"],
  ASUS: ["Windows Laptop", "Desktop PC", "Monitor", "Other ASUS"],
  HP: ["Windows Laptop", "Desktop PC", "Printer", "Monitor", "Other HP"],
  Dell: ["Windows Laptop", "Desktop PC", "Monitor", "Other Dell"],
  Lenovo: ["Windows Laptop", "Desktop PC", "Android Tablet", "Other Lenovo"],
  Acer: ["Windows Laptop", "Desktop PC", "Monitor", "Other Acer"],
  Microsoft: ["Surface Laptop", "Surface Pro", "Surface Tablet", "Xbox", "Other Microsoft"],
  Other: ["Mobile Phone", "Tablet", "Laptop", "Desktop PC", "Printer", "Monitor", "Other Device"],
};

const chips = [
  "Cracked Screen", "Won't Turn On", "Battery Issue", "Water Damage",
  "Charging Port", "Camera Issue", "Speaker / Mic", "Slow / Freezing",
  "Software Issue", "Keyboard / Trackpad", "Cracked Back Glass", "Other",
];

const defaultForm = {
  firstName: "", lastName: "", phone: "", email: "",
  brand: "", deviceType: "", model: "", serial: "", colour: "",
  problemDesc: "", urgency: "", chips: [] as string[], agreed: false,
};

export default function CheckInPage() {
  const { store } = useStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ ...defaultForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [jobRef, setJobRef] = useState("");
  const [done, setDone] = useState(false);

  function update(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function toggleChip(chip: string) {
    const chips = form.chips.includes(chip)
      ? form.chips.filter((c) => c !== chip)
      : [...form.chips, chip];
    update("chips", chips);
  }

  function validateStep(s: number) {
    const errs: Record<string, string> = {};

    if (s === 1) {
      if (!form.firstName.trim()) errs.firstName = "Please enter your first name";
      if (!form.lastName.trim()) errs.lastName = "Please enter your last name";
      if (!/^[\d\s\-\(\)\+]{8,}$/.test(form.phone.trim())) errs.phone = "Please enter a valid phone number";
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Please enter a valid email";
    } else if (s === 2) {
      if (!form.brand) errs.brand = "Please select a brand";
      if (!form.deviceType) errs.deviceType = "Please select a device type";
      if (!form.model.trim()) errs.model = "Please enter the device model";
    } else if (s === 3) {
      if (form.problemDesc.trim().length < 10) errs.problemDesc = "Please describe the problem (at least 10 characters)";
      if (!form.agreed) errs.agreed = "You must agree to the terms to proceed";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep(step + 1);
  }

  function prev() {
    setStep(step - 1);
  }

  async function submitForm() {
    if (!validateStep(3)) return;
    setLoading(true);

    try {
      const sid = String(store?.id || 1);

      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-store-id": sid },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          brand: form.brand,
          deviceType: form.deviceType,
          model: form.model.trim(),
          serial: form.serial.trim(),
          colour: form.colour.trim(),
          problemDesc: form.problemDesc.trim(),
          urgency: form.urgency,
          chips: form.chips,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      const data = await res.json();

      setJobRef(data.ticketNumber);
      setDone(true);
      setStep(0);
    } catch (e) {
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ ...defaultForm });
    setErrors({});
    setDone(false);
    setStep(1);
  }

  function StepCircle({ num, label }: { num: number; label: string }) {
    const isDone = step > num;
    const isActive = step === num;
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
            isDone
              ? "bg-[#f69323] border-[#f69323] text-white"
              : isActive
              ? "border-[#f69323] text-[#f69323] shadow-[0_0_0_4px_rgba(246,147,35,0.18)]"
              : "border-[#e0e0e8] text-[#6b6b80] bg-white"
          }`}
        >
          {isDone ? "✓" : num}
        </div>
        <span
          className={`text-[11px] font-medium uppercase tracking-wider ${
            isActive ? "text-[#f69323]" : "text-[#6b6b80]"
          }`}
        >
          {label}
        </span>
      </div>
    );
  }

  function Err({ field }: { field: string }) {
    if (!errors[field]) return null;
    return <p className="text-[11px] text-red-500 mt-1">{errors[field]}</p>;
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center px-4 pb-16">
        <div className="w-full max-w-[680px] text-center pt-16">
          <div className="w-[76px] h-[76px] bg-gradient-to-br from-[#f69323] to-[#e07a10] rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg">✓</div>
          <h2 className="text-2xl font-extrabold mb-2">You're Checked In!</h2>
          <p className="text-[#6b6b80] text-sm max-w-[360px] mx-auto mb-6">
            Our technician will be with you shortly. Please keep your reference number.
          </p>
          <div className="bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl px-8 py-5 inline-block mb-6">
            <p className="text-[11px] text-[#6b6b80] uppercase tracking-wider mb-1">Job Reference</p>
            <p className="text-3xl font-extrabold text-[#f69323]">{jobRef}</p>
          </div>
          <p className="text-xs text-[#6b6b80] mb-6">We'll SMS updates to your number as your repair progresses.</p>
          <button onClick={resetForm} className="bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl px-6 py-3 text-sm font-medium hover:border-[#f69323] hover:text-[#f69323] transition-colors">
            New Check-In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center px-4 pb-16">
      <div className="w-full max-w-[680px] text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-2 bg-white border border-[#e0e0e8] rounded-full px-5 py-2 text-xs text-[#6b6b80] mb-5">
          <span className="w-2 h-2 rounded-full bg-[#f69323]" />
          RepairDesk · Check-In
        </div>
        <h1 className="text-[clamp(26px,5vw,38px)] font-extrabold mb-2">
          Repair <span className="text-[#f69323]">Check-In</span>
        </h1>
        <p className="text-[#6b6b80] text-sm">Fill in your details below. Takes less than 2 minutes.</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center w-full max-w-[680px] mb-7">
        <StepCircle num={1} label="Your Info" />
        <div className={`flex-1 h-[2px] mx-2 mb-5 transition-colors ${step > 1 ? "bg-[#f69323]" : "bg-[#e0e0e8]"}`} />
        <StepCircle num={2} label="Device" />
        <div className={`flex-1 h-[2px] mx-2 mb-5 transition-colors ${step > 2 ? "bg-[#f69323]" : "bg-[#e0e0e8]"}`} />
        <StepCircle num={3} label="Problem" />
      </div>

      <div className="w-full max-w-[680px] bg-white border border-[#e0e0e8] rounded-2xl p-9 max-sm:p-5 shadow-md">
        {/* Step 1 */}
        {step === 1 && (
          <>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 bg-gradient-to-br from-[#f69323] to-[#e07a10] rounded-lg flex items-center justify-center text-sm">👤</span>
              <h2 className="font-bold text-lg">Your Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">First Name <span className="text-[#f69323]">*</span></label>
                <input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="John" className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all" />
                <Err field="firstName" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">Last Name <span className="text-[#f69323]">*</span></label>
                <input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Smith" className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all" />
                <Err field="lastName" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">Phone Number <span className="text-[#f69323]">*</span></label>
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="04xx xxx xxx" className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all" />
                <Err field="phone" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">Email Address</label>
                <input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@email.com" className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all" />
                <Err field="email" />
              </div>
            </div>
            <div className="flex justify-end mt-7">
              <button onClick={next} className="bg-gradient-to-br from-[#f69323] to-[#e07a10] text-white font-semibold px-7 py-3 rounded-xl text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Next — Device Info →
              </button>
            </div>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 bg-gradient-to-br from-[#f69323] to-[#e07a10] rounded-lg flex items-center justify-center text-sm">📱</span>
              <h2 className="font-bold text-lg">Device Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">Brand <span className="text-[#f69323]">*</span></label>
                <select value={form.brand} onChange={(e) => { update("brand", e.target.value); update("deviceType", ""); }} className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all appearance-none">
                  <option value="">Select brand…</option>
                  {Object.keys(brandDeviceMap).map((b) => <option key={b}>{b}</option>)}
                </select>
                <Err field="brand" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">Device Type <span className="text-[#f69323]">*</span></label>
                <select value={form.deviceType} onChange={(e) => update("deviceType", e.target.value)} className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all appearance-none">
                  <option value="">{form.brand ? "Select type…" : "Select brand first…"}</option>
                  {(brandDeviceMap[form.brand] || []).map((t) => <option key={t}>{t}</option>)}
                </select>
                <Err field="deviceType" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">Model <span className="text-[#f69323]">*</span></label>
                <input value={form.model} onChange={(e) => update("model", e.target.value)} placeholder="e.g. iPhone 15 Pro, Galaxy S24, MacBook Air M2" className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all" />
                <Err field="model" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">Serial / IMEI <span className="text-[10px] font-normal normal-case">(optional)</span></label>
                <input value={form.serial} onChange={(e) => update("serial", e.target.value)} placeholder="Optional" className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">Colour</label>
                <input value={form.colour} onChange={(e) => update("colour", e.target.value)} placeholder="e.g. Space Black" className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all" />
              </div>
            </div>
            <div className="flex justify-between mt-7">
              <button onClick={prev} className="bg-transparent border border-[#e0e0e8] rounded-xl text-[#6b6b80] font-medium px-5 py-3 text-sm hover:border-[#6b6b80] hover:text-black transition-all">← Back</button>
              <button onClick={next} className="bg-gradient-to-br from-[#f69323] to-[#e07a10] text-white font-semibold px-7 py-3 rounded-xl text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Next — Describe Problem →
              </button>
            </div>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 bg-gradient-to-br from-[#f69323] to-[#e07a10] rounded-lg flex items-center justify-center text-sm">🔧</span>
              <h2 className="font-bold text-lg">What's the Problem?</h2>
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">
                Common Issues <span className="text-[10px] font-normal normal-case">(select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleChip(chip)}
                    className={`px-3.5 py-1.5 rounded-full text-xs border transition-all ${
                      form.chips.includes(chip)
                        ? "bg-[rgba(246,147,35,0.1)] border-[#f69323] text-[#f69323] font-semibold"
                        : "bg-[#f9f9fb] border-[#e0e0e8] text-[#6b6b80] hover:border-[#f69323]"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">Describe the Problem <span className="text-[#f69323]">*</span></label>
              <textarea value={form.problemDesc} onChange={(e) => update("problemDesc", e.target.value)} placeholder="Please describe what happened and what you've noticed…" rows={4} className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all resize-y" />
              <Err field="problemDesc" />
            </div>

            <div className="h-px bg-[#e0e0e8] my-5" />

            <div className="bg-[rgba(246,147,35,0.07)] border border-[rgba(246,147,35,0.25)] rounded-xl p-3.5 text-xs text-[#6b6b80] flex gap-2.5 mb-4">
              <span>🔒</span>
              <span>If your device needs a PIN or password to test, our technician will ask you privately. <strong>Do not enter passwords here.</strong></span>
            </div>

            <div className="mb-5">
              <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-wider">How urgent is your repair?</label>
              <select value={form.urgency} onChange={(e) => update("urgency", e.target.value)} className="mt-1 w-full px-3.5 py-3 bg-[#f9f9fb] border border-[#e0e0e8] rounded-xl text-sm focus:border-[#f69323] focus:ring-3 focus:ring-[rgba(246,147,35,0.12)] outline-none transition-all appearance-none">
                <option value="">Select…</option>
                <option>Standard (3–5 business days)</option>
                <option>Express (1–2 business days)</option>
                <option>Same Day (if available)</option>
                <option>I'm flexible</option>
              </select>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => update("agreed", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#e0e0e8] text-[#f69323] focus:ring-[#f69323]"
              />
              <span className="text-xs text-[#6b6b80] leading-relaxed">
                I confirm that the information provided is accurate, and I agree to the{" "}
                <span className="text-[#f69323] underline decoration-dotted">Terms &amp; Conditions</span> and{" "}
                <span className="text-[#f69323] underline decoration-dotted">Privacy Policy</span>. I understand that data backup is recommended prior to any repair.
              </span>
            </label>
            <Err field="agreed" />

            <div className="flex justify-between mt-7">
              <button onClick={prev} className="bg-transparent border border-[#e0e0e8] rounded-xl text-[#6b6b80] font-medium px-5 py-3 text-sm hover:border-[#6b6b80] hover:text-black transition-all">← Back</button>
              <button onClick={submitForm} disabled={loading} className="bg-gradient-to-br from-[#f69323] to-[#e07a10] text-white font-semibold px-7 py-3 rounded-xl text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? "Submitting..." : "Submit Check-In ✓"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

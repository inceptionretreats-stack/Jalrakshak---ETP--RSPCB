"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Building2, Droplets, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { JalRakshakLogo } from "@/components/shared/logo";
import { useDataStore } from "@/lib/store/data";
import { useAuthStore } from "@/lib/store/auth";
import { useAccountsStore } from "@/lib/store/accounts";

const schema = z.object({
  name: z.string().min(2, "Company name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  area: z.string().min(2, "Area is required"),
  consentNumber: z.string().min(4, "Consent number required"),
  mobile: z.string().min(8, "Valid mobile required"),
  email: z.string().regex(/^\S+@\S+\.\S+$/, "Valid email required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  etpCapacity: z.coerce.number().positive("Must be > 0"),
  maxEffluentGeneration: z.coerce.number().positive("Must be > 0"),
  roStage1: z.coerce.number().positive("Must be > 0"),
  roStage2: z.coerce.number().nonnegative(),
  roStage3: z.coerce.number().nonnegative(),
  roStage4: z.coerce.number().nonnegative(),
  meeCapacity: z.coerce.number().positive("Must be > 0"),
});

type FormValues = z.input<typeof schema>;

export default function RegisterEtpPage() {
  const router = useRouter();
  const registerIndustry = useDataStore((s) => s.registerIndustry);
  const login = useAuthStore((s) => s.login);
  const signup = useAccountsStore((s) => s.signup);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((values) => {
    const v = schema.parse(values);
    setSubmitting(true);
    const created = registerIndustry({
      name: v.name,
      ownerName: v.ownerName,
      area: v.area,
      mobile: v.mobile,
      email: v.email,
      consentNumber: v.consentNumber,
      permittedKLD: v.maxEffluentGeneration,
      etpCapacity: v.etpCapacity,
      roCapacity: v.roStage1,
      meeCapacity: v.meeCapacity,
      cetpId: null,
      maxEffluentGeneration: v.maxEffluentGeneration,
      roStage1: v.roStage1,
      roStage2: v.roStage2,
      roStage3: v.roStage3,
      roStage4: v.roStage4,
    });
    const acct = signup({ name: v.ownerName, email: v.email, password: v.password, role: "etp", industryId: created.id });
    if (!acct.ok) toast.warning("Account note", { description: acct.error });
    toast.success("ETP unit registered", { description: `${created.name} is now pending verification.` });
    login("etp", created.id);
    setTimeout(() => router.push("/dashboard"), 600);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50/70">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        <div className="flex items-center justify-between">
          <JalRakshakLogo size={36} />
          <Button asChild variant="ghost" size="sm" className="h-9 gap-1.5 px-3 text-slate-500">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          </Button>
        </div>

        <div className="mt-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            <Droplets className="h-3.5 w-3.5" /> Individual ETP · Self Registration
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Register your ETP unit</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Provide your unit details and treatment capacities. All capacities are recorded in KLD. On submit you&apos;ll enter your ETP panel.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {/* general info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-slate-800">
              <Building2 className="h-4 w-4 text-teal-600" /> Company Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company Name" error={errors.name?.message}>
                <input {...register("name")} className={inputCls} placeholder="e.g. Pali Road Processors" />
              </Field>
              <Field label="Owner Name" error={errors.ownerName?.message}>
                <input {...register("ownerName")} className={inputCls} placeholder="Full name" />
              </Field>
              <Field label="Area / Location" error={errors.area?.message}>
                <input {...register("area")} className={inputCls} placeholder="Industrial area, zone" />
              </Field>
              <Field label="Consent Number" error={errors.consentNumber?.message}>
                <input {...register("consentNumber")} className={inputCls} placeholder="RPCB/CTO/2024/XXXXX" />
              </Field>
              <Field label="Mobile" error={errors.mobile?.message}>
                <input {...register("mobile")} className={inputCls} placeholder="+91 ..." />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input {...register("email")} className={inputCls} placeholder="plant@company.in" />
              </Field>
              <Field label="Login Password" error={errors.password?.message}>
                <input type="password" {...register("password")} className={inputCls} placeholder="Set a password to sign in later" />
              </Field>
            </div>
          </div>

          {/* capacities (KLD) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-slate-800">
              <Droplets className="h-4 w-4 text-teal-600" /> Treatment Capacities (KLD)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="ETP Capacity (KLD)" error={errors.etpCapacity?.message}>
                <input type="number" step="any" {...register("etpCapacity")} className={inputCls} placeholder="0" />
              </Field>
              <Field label="Maximum Effluent Generation (KLD)" error={errors.maxEffluentGeneration?.message}>
                <input type="number" step="any" {...register("maxEffluentGeneration")} className={inputCls} placeholder="0" />
              </Field>
              <Field label="MEE Capacity (KLD)" error={errors.meeCapacity?.message}>
                <input type="number" step="any" {...register("meeCapacity")} className={inputCls} placeholder="0" />
              </Field>
              <Field label="RO Stage I (KLD)" error={errors.roStage1?.message}>
                <input type="number" step="any" {...register("roStage1")} className={inputCls} placeholder="0" />
              </Field>
              <Field label="RO Stage II (KLD)" error={errors.roStage2?.message}>
                <input type="number" step="any" {...register("roStage2")} className={inputCls} placeholder="0" />
              </Field>
              <Field label="RO Stage III (KLD)" error={errors.roStage3?.message}>
                <input type="number" step="any" {...register("roStage3")} className={inputCls} placeholder="0" />
              </Field>
              <Field label="RO Stage IV (KLD)" error={errors.roStage4?.message}>
                <input type="number" step="any" {...register("roStage4")} className={inputCls} placeholder="0" />
              </Field>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="h-12 w-full gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-base font-semibold text-white hover:from-teal-600/90 hover:to-cyan-600/90"
          >
            <Check className="h-4 w-4" />
            {submitting ? "Registering…" : "Register & Enter ETP Panel"}
          </Button>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-teal-400 focus:bg-white";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Building2, Droplets, RotateCcw, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/store/data";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Company name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  area: z.string().min(2, "Area is required"),
  mobile: z.string().min(8, "Valid mobile required"),
  email: z.string().regex(/^\S+@\S+\.\S+$/, "Valid email required"),
  consentNumber: z.string().min(4, "Consent number required"),
  permittedKLD: z.coerce.number().positive("Must be > 0"),
  etpCapacity: z.coerce.number().positive("Must be > 0"),
  roCapacity: z.coerce.number().nonnegative(),
  meeCapacity: z.coerce.number().nonnegative(),
});

type FormValues = z.input<typeof schema>;

export default function RegisterMemberPage() {
  const registerIndustry = useDataStore((s) => s.registerIndustry);
  const [done, setDone] = useState<null | { name: string; id: string }>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((values) => {
    const parsed = schema.parse(values);
    const created = registerIndustry({
      name: parsed.name,
      ownerName: parsed.ownerName,
      area: parsed.area,
      mobile: parsed.mobile,
      email: parsed.email,
      consentNumber: parsed.consentNumber,
      permittedKLD: parsed.permittedKLD,
      etpCapacity: parsed.etpCapacity,
      roCapacity: parsed.roCapacity,
      meeCapacity: parsed.meeCapacity,
      cetpId: null,
    });
    toast.success("Member registered", { description: `${created.name} added with status “pending”.` });
    setDone({ name: created.name, id: created.id });
  });

  if (done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-16 text-center">
        <motion.span
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"
        >
          <Check className="h-10 w-10" strokeWidth={3} />
        </motion.span>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="font-display text-2xl font-bold text-foreground">Registration submitted</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{done.name}</span> ({done.id}) has been registered and is now
            pending RSPCB verification.
          </p>
        </motion.div>
        <div className="mt-2 flex gap-3">
          <Button asChild className="gap-2 rounded-xl">
            <Link href="/dashboard/industries">
              <ListChecks className="h-4 w-4" /> View industries
            </Link>
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl" onClick={() => { reset(); setDone(null); }}>
            <RotateCcw className="h-4 w-4" /> Register another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/industries" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Industries
      </Link>
      <PageHeader eyebrow="Industry Management" title="Register New ETP Unit" description="Onboard a textile unit running its own individual ETP. Submission enters the verification queue." />

      <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <Section title="Company Details" icon={<Building2 className="h-4 w-4" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company Name" error={errors.name?.message}>
                <input {...register("name")} className={inputCls} placeholder="e.g. Shree Balaji Textiles" />
              </Field>
              <Field label="Owner Name" error={errors.ownerName?.message}>
                <input {...register("ownerName")} className={inputCls} placeholder="Full name" />
              </Field>
              <Field label="Area / Location" error={errors.area?.message}>
                <input {...register("area")} className={inputCls} placeholder="Industrial area, phase" />
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
            </div>
          </Section>

          <Section title="Capacity (KLD)" icon={<ListChecks className="h-4 w-4" />}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Permitted" error={errors.permittedKLD?.message}>
                <input type="number" {...register("permittedKLD")} className={inputCls} placeholder="0" />
              </Field>
              <Field label="ETP" error={errors.etpCapacity?.message}>
                <input type="number" {...register("etpCapacity")} className={inputCls} placeholder="0" />
              </Field>
              <Field label="RO" error={errors.roCapacity?.message}>
                <input type="number" {...register("roCapacity")} className={inputCls} placeholder="0" />
              </Field>
              <Field label="MEE" error={errors.meeCapacity?.message}>
                <input type="number" {...register("meeCapacity")} className={inputCls} placeholder="0" />
              </Field>
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <Section title="Registration Type" icon={<Droplets className="h-4 w-4" />}>
              <p className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                Registered as an <span className="font-semibold text-foreground">Individual ETP</span> unit — a textile unit operating its own Effluent Treatment Plant (no CETP).
              </p>
            </Section>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <p className="text-sm text-muted-foreground">
              On submission the unit is created with a <span className="font-semibold text-amber-400">pending</span> status and
              enters the approval workflow for RSPCB verification.
            </p>
            <Button type="submit" disabled={isSubmitting} className="mt-4 h-11 w-full gap-2 rounded-xl text-base font-semibold">
              <Check className="h-4 w-4" />
              {isSubmitting ? "Submitting…" : "Submit Registration"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-xl border border-border bg-muted/30 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

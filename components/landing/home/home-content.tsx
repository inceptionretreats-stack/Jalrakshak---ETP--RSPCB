"use client";

import { SiteHeader } from "../site-header";
import { HeroSection } from "./hero-section";
import { EtpUnitsOverview } from "./etp-overview";
import { AboutSlideshow } from "./about-slideshow";
import { ContactSection } from "./contact-section";
import { SiteFooter } from "../site-footer";

export function HomeContent() {
  return (
    <div className="relative bg-background">
      <SiteHeader />
      <HeroSection />
      <EtpUnitsOverview />
      <AboutSlideshow />
      <ContactSection />
      <SiteFooter />
    </div>
  );
}

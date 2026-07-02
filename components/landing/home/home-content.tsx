"use client";

import { SiteHeader } from "../site-header";
import { HeroSection } from "./hero-section";
import { AboutSlideshow } from "./about-slideshow";
import { ContactSection } from "./contact-section";
import { SiteFooter } from "../site-footer";

export function HomeContent() {
  return (
    <div className="relative bg-background">
      <SiteHeader />
      <HeroSection />
      <AboutSlideshow />
      <ContactSection />
      <SiteFooter />
    </div>
  );
}

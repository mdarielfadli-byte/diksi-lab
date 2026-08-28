update public.client_public_dashboards
set payload = payload
  || jsonb_build_object(
    'planned_work', jsonb_build_array(
      jsonb_build_object('date', '29 AGU', 'scheduled_for', '2026-08-29', 'activity', 'Kickoff Cycle 0 & penguncian readiness', 'area', 'Governance', 'status', 'Terjadwal', 'owner', 'DiksiLab × bangunbrandmu × Dr. Santi Story'),
      jsonb_build_object('date', '2 — 4 SEP', 'scheduled_for', '2026-09-02', 'activity', 'Audit baseline Instagram, LinkedIn, ads, positioning, dan audiens', 'area', 'Content & performance', 'status', 'Terjadwal', 'owner', 'DiksiLab'),
      jsonb_build_object('date', '8 — 15 SEP', 'scheduled_for', '2026-09-08', 'activity', 'Website, CTA, SEO, dan funnel/CRM', 'area', 'Digital foundation', 'status', 'Terjadwal', 'owner', 'DiksiLab'),
      jsonb_build_object('date', '19 — 27 SEP', 'scheduled_for', '2026-09-19', 'activity', 'Produksi, QA, handover, dan rekomendasi Cycle 1', 'area', 'Delivery', 'status', 'Terjadwal', 'owner', 'DiksiLab × bangunbrandmu')
    ),
    'roadmap', jsonb_build_array(
      jsonb_build_object('phase', 'Cycle 0', 'period', '29 Agu — 27 Sep 2026', 'title', 'Foundation & Digital Readiness', 'focus', 'Positioning, website, landing-page system, SEO, audit, CRM, dan HAKI.', 'status', 'active'),
      jsonb_build_object('phase', 'Fase 1', 'period', 'Okt — Des 2026', 'title', 'Sistem Konten & Aktivasi Awal', 'focus', 'Sistem konten, SEO, paid media, dan aktivasi awal.', 'status', 'next'),
      jsonb_build_object('phase', 'Fase 2', 'period', 'Jan — Jun 2027', 'title', 'Kesiapan Monetisasi', 'focus', 'Workshop, coaching, speaking, komunitas, dan pipeline endorsement.', 'status', 'future'),
      jsonb_build_object('phase', 'Fase 3', 'period', 'Jul — Des 2027', 'title', 'Scale & Book Deal', 'focus', 'Media exposure, pitch book deal, dan evaluasi scale-up.', 'status', 'future')
    )
  ),
  updated_at = now(),
  updated_by = 'DiksiLab'
where slug = 'dr-santi-story';

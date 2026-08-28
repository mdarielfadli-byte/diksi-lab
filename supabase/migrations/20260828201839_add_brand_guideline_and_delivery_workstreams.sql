update public.client_public_dashboards
set payload = payload || jsonb_build_object(
  'brand_guideline', jsonb_build_object(
    'positioning', 'Membangun budaya baca yang lebih kuat melalui ide yang thoughtful, ritual praktis, dan percakapan bermakna.',
    'personality', jsonb_build_array('Curious', 'Nurturing', 'Credible', 'Practical'),
    'colors', jsonb_build_array(
      jsonb_build_object('name', 'Primary Emerald', 'hex', '#21866F', 'role', 'Brand field, heading, CTA'),
      jsonb_build_object('name', 'Forest', 'hex', '#1F5B4C', 'role', 'Authority & premium'),
      jsonb_build_object('name', 'Warm Cream', 'hex', '#F4F0E7', 'role', 'Canvas & reading'),
      jsonb_build_object('name', 'Taupe', 'hex', '#B3977A', 'role', 'Refined neutral'),
      jsonb_build_object('name', 'Gold', 'hex', '#F1C24B', 'role', 'Ritual marker'),
      jsonb_build_object('name', 'Coral', 'hex', '#E45B4B', 'role', 'Human accent')
    ),
    'typography', 'Rounded geometric sans untuk headline dan body; serif editorial hanya untuk quote atau esai reflektif.',
    'imagery', 'Natural light, buku dalam konteks, interaksi nyata, ruang belajar, keluarga, dan komunitas. Hindari hard flash, stok generik, dan teks di atas wajah.',
    'tone', 'Warm authority: human tension → perspective → concrete example → relevant invitation.',
    'cta', 'Invite Dr Santi untuk sekolah/event; Start a reading conversation untuk parent/community.'
  ),
  'delivery_workstreams', jsonb_build_array(
    jsonb_build_object('name', 'Website', 'status', 'ready', 'owner', 'DiksiLab', 'due', 'Cycle 1', 'outputs', jsonb_build_array('Sitemap & wireframe', 'Homepage dan core pages', 'Domain decision', 'GA4, Search Console, Pixel'), 'kpi', 'Website ready dan conversion tracking aktif'),
    jsonb_build_object('name', 'Landing Page', 'status', 'ready', 'owner', 'DiksiLab', 'due', 'Cycle 1', 'outputs', jsonb_build_array('Speaking & workshop page', 'CTA dan inquiry form', 'Event tracking', 'WhatsApp click'), 'kpi', 'Landing-page conversion rate'),
    jsonb_build_object('name', 'SEO', 'status', 'planned', 'owner', 'DiksiLab', 'due', 'Cycle 1–2', 'outputs', jsonb_build_array('Keyword map', 'On-page & technical SEO', '2–4 article assets/bulan', 'Schema dan indexing'), 'kpi', 'Organic visibility dan qualified inquiry'),
    jsonb_build_object('name', 'Brevo CRM', 'status', 'ready', 'owner', 'DiksiLab', 'due', 'Cycle 0–1', 'outputs', jsonb_build_array('Lead pipeline', 'Form field & tagging', 'Owner dan SLA follow-up', 'Source/UTM attribution'), 'kpi', 'Lead response time dan qualified lead rate'),
    jsonb_build_object('name', 'Email Marketing', 'status', 'planned', 'owner', 'DiksiLab', 'due', 'Cycle 1', 'outputs', jsonb_build_array('Confirmation email', '5-step e-book nurture', 'Inquiry follow-up', 'Newsletter segmentation'), 'kpi', 'Open, click, dan email-to-inquiry rate'),
    jsonb_build_object('name', 'Ads', 'status', 'planned', 'owner', 'DiksiLab', 'due', 'Cycle 2', 'outputs', jsonb_build_array('Audience & creative test', 'Budget split', 'Landing-page destination', 'Retargeting & lead magnet'), 'kpi', 'CPL dan cost per qualified lead')
  ),
  'client_actions', jsonb_build_array(
    jsonb_build_object('title', 'Konfirmasi domain utama', 'detail', 'Pilih .com atau .id dan amankan domain kedua untuk redirect.', 'status', 'needs_approval', 'due', 'Kickoff'),
    jsonb_build_object('title', 'Kirim aset dan kredensial', 'detail', 'Logo, 15–20 foto, bio/credential final, program, testimoni, dan akses terkait.', 'status', 'needs_input', 'due', 'Minggu 1'),
    jsonb_build_object('title', 'Tetapkan final approver', 'detail', 'Satu PIC approval dengan SLA feedback maksimal dua hari kerja.', 'status', 'needs_approval', 'due', 'Kickoff')
  )
), updated_at = now(), updated_by = 'DiksiLab'
where slug = 'dr-santi-story';

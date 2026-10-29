(function () {
  'use strict';
  var D = document;

  /* ---------- page source (used when the page saves itself) ---------- */
  var FONTS = 'https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@500;600;700&amp;family=IBM+Plex+Mono:wght@400;500&amp;family=IBM+Plex+Sans+Thai:wght@400;500;600&amp;display=swap';
  var HEAD_EXTRA = '<meta name="claude:viewport-fit-sides" content="cover"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="' + FONTS + '">';
  var RESET = ':root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}';
  var LIMIT = 16 * 1048576;
  var MAX_BYTES = 15.6 * 1048576;
  var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';

  function textOf(id) { var el = D.getElementById(id); return el ? el.textContent : ''; }
  var CSS_SRC = textOf('pf-css');
  var APP_SRC = textOf('pf-app');
  /* INLINE = single-file build (claude.ai / dist/portfolio.html): data, CSS and JS live inside the page.
     Project mode = index.html + styles.css + app.js + data/portfolio.js + images/ (edited with Claude Code). */
  var INLINE = !!D.getElementById('pf-data');

  /* ---------- vocabulary ---------- */
  var CATS = ['app', 'kol', 'cert', 'acad', 'other'];
  var CAT = {
    app: {
      name: { th: 'แอพ & เว็บ', en: 'Apps & Web' },
      add: { th: 'เพิ่มแอพหรือเว็บ', en: 'Add an app or site' },
      none: { th: 'ยังไม่มีแอพหรือเว็บ', en: 'No apps or sites yet' },
      empty: { th: 'ใส่ชื่อแอพ ปัญหาที่แก้ ฟีเจอร์หลัก และแคปหน้าจอ พร้อมลิงก์ให้คนลองใช้', en: 'Add the app, the problem it solves, key features and screenshots, plus a link people can try.' },
      org: { th: 'ทำให้ / ใช้กับ', en: 'Built for' },
      orgPh: { th: 'เช่น ธุรกิจของเรา, ลูกค้า, ใช้ส่วนตัว', en: 'e.g. my business, a client, personal use' },
      titlePh: { th: 'ชื่อแอพ', en: 'App name' },
      rolePh: { th: 'เช่น ออกแบบและพัฒนาเองทั้งหมด', en: 'e.g. Designed and built end to end' },
      metricHint: { th: 'ตัวอย่าง: ผู้ใช้ · 50 คน, ฟีเจอร์ · 12 อย่าง', en: 'Example: Users · 50, Features · 12' },
      linkHint: { th: 'ลิงก์แอพ เดโม หรือวิดีโอ', en: 'App, demo or video link' }
    },
    kol: {
      name: { th: 'งาน KOL', en: 'KOL Campaigns' },
      add: { th: 'เพิ่มงาน KOL', en: 'Add a KOL campaign' },
      none: { th: 'ยังไม่มีงาน KOL', en: 'No KOL campaigns yet' },
      empty: { th: 'ใส่แบรนด์ ชื่อ KOL และช่องทางที่ร่วมงาน ผลลัพธ์ที่วัดได้ เช่น ยอดวิว ยอดขาย และแคปหน้าจอโพสต์จริงเป็นหลักฐาน', en: 'Add the brand, the creator and channel, measurable results such as views or sales, and screenshots of the live posts.' },
      org: { th: 'แบรนด์ / ลูกค้า', en: 'Brand / client' },
      orgPh: { th: 'ชื่อแบรนด์หรือสินค้า', en: 'Brand or product' },
      titlePh: { th: 'ชื่อแคมเปญ', en: 'Campaign name' },
      rolePh: { th: 'เช่น ติดต่อและดูแล KOL, เขียนบรีฟ', en: 'e.g. Sourced and managed the creator, wrote the brief' },
      metricHint: { th: 'ตัวอย่าง: ยอดวิว · 120K, Engagement · 8.4%, ยอดขาย · 350 ชิ้น', en: 'Example: Views · 120K, Engagement · 8.4%, Sales · 350 units' },
      linkHint: { th: 'ลิงก์โพสต์หรือคลิปจริง', en: 'Link to the live post or clip' }
    },
    cert: {
      name: { th: 'ใบเซอร์ & รางวัล', en: 'Certificates & Awards' },
      add: { th: 'เพิ่มใบเซอร์', en: 'Add a certificate' },
      none: { th: 'ยังไม่มีใบเซอร์', en: 'No certificates yet' },
      empty: { th: 'อัปโหลดรูปหรือ PDF ของใบเซอร์ ใส่ผู้ออก วันที่ และ Credential ID แล้วคัดลอกไปกรอกใน LinkedIn ได้ทันที', en: 'Upload an image or PDF of the certificate, add the issuer, date and credential ID, then copy each field into LinkedIn.' },
      org: { th: 'ออกโดย', en: 'Issued by' },
      orgPh: { th: 'เช่น Google, มหาวิทยาลัย, สมาคม', en: 'e.g. Google, a university, an association' },
      titlePh: { th: 'ชื่อใบเซอร์หรือรางวัล', en: 'Certificate or award name' },
      rolePh: { th: 'เช่น ผู้เข้าร่วม, รางวัลชนะเลิศ', en: 'e.g. Participant, First place' },
      metricHint: { th: 'ตัวอย่าง: คะแนน · 92/100, ชั่วโมงเรียน · 40', en: 'Example: Score · 92/100, Hours · 40' },
      linkHint: { th: 'ลิงก์ตรวจสอบใบเซอร์', en: 'Verification link' }
    },
    acad: {
      name: { th: 'งานวิชาการ', en: 'Academic Projects' },
      add: { th: 'เพิ่มงานวิชาการ', en: 'Add an academic project' },
      none: { th: 'ยังไม่มีงานวิชาการ', en: 'No academic projects yet' },
      empty: { th: 'ใส่ชื่องาน รายวิชา บทบาทในกลุ่ม และสิ่งที่วิเคราะห์หรือเสนอ', en: 'Add the project, the course, your role in the team and what you analysed or proposed.' },
      org: { th: 'รายวิชา / สถาบัน', en: 'Course / institution' },
      orgPh: { th: 'ชื่อวิชาหรือมหาวิทยาลัย', en: 'Course or university' },
      titlePh: { th: 'ชื่องาน', en: 'Project title' },
      rolePh: { th: 'เช่น หัวหน้ากลุ่ม, ผู้จัดทำ', en: 'e.g. Team lead, Author' },
      metricHint: { th: 'ตัวอย่าง: เกรด · A, จำนวนบท · 15', en: 'Example: Grade · A, Chapters · 15' },
      linkHint: { th: 'ลิงก์ไฟล์งานหรือสไลด์', en: 'Link to the file or slides' }
    },
    other: {
      name: { th: 'อื่น ๆ', en: 'Other' },
      add: { th: 'เพิ่มผลงานอื่น', en: 'Add other work' },
      none: { th: 'ยังไม่มีผลงานอื่น', en: 'No other work yet' },
      empty: { th: 'กิจกรรม งานอาสา งานพาร์ทไทม์ หรือผลงานที่ไม่เข้าหมวดไหน', en: 'Activities, volunteering, part-time work or anything that fits nowhere else.' },
      org: { th: 'หน่วยงาน', en: 'Organization' },
      orgPh: { th: 'ชื่อหน่วยงานหรือโครงการ', en: 'Organization or programme' },
      titlePh: { th: 'ชื่อผลงาน', en: 'Title' },
      rolePh: { th: 'บทบาทของเรา', en: 'Your role' },
      metricHint: { th: '', en: '' },
      linkHint: { th: 'ลิงก์ที่เกี่ยวข้อง', en: 'Related link' }
    }
  };
  var STATUS = {
    live: { th: 'ใช้งานจริง', en: 'Live' },
    dev: { th: 'กำลังพัฒนา', en: 'In development' },
    proto: { th: 'ต้นแบบ', en: 'Prototype' }
  };
  var TINTS = ['coral', 'peach', 'sand', 'mint', 'sage', 'fog', 'dusk', 'blossom', 'clay'];
  var TINT_NAMES = { coral: ['ปะการัง', 'Coral'], peach: ['พีช', 'Peach'], sand: ['ทราย', 'Sand'], mint: ['มินต์', 'Mint'], sage: ['เสจ', 'Sage'], fog: ['หมอก', 'Fog'], dusk: ['สนธยา', 'Dusk'], blossom: ['ซากุระ', 'Blossom'], clay: ['ดินเผา', 'Clay'] };
  function tintName(k) { return k && TINT_NAMES[k] ? (lang === 'en' ? TINT_NAMES[k][1] : TINT_NAMES[k][0]) : t('noColor'); }
  var MONTHS = {
    th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };
  var STR = {
    brand: ['แฟ้มผลงาน', 'Portfolio'],
    langAria: ['Switch to English', 'เปลี่ยนเป็นภาษาไทย'],
    editOff: ['แก้ไขหน้า', 'Edit page'],
    editOn: ['กำลังแก้ไข', 'Editing'],
    contents: ['สารบัญผลงาน', 'Contents'],
    itemsUnit: ['ชิ้น', 'items'],
    updated: ['อัปเดตล่าสุด', 'Last updated'],
    all: ['ทั้งหมด', 'All'],
    allWork: ['ผลงานทั้งหมด', 'All work'],
    search: ['ค้นหาผลงาน ทักษะ หรือแบรนด์', 'Search work, skills or brands'],
    featured: ['ปักหมุด', 'Pinned'],
    noResults: ['ไม่พบผลงานที่ตรงกับคำค้น', 'No work matches your search'],
    emptyPublic: ['ยังไม่มีผลงานในหมวดนี้', 'Nothing in this section yet'],
    untitled: ['ไม่มีชื่อ', 'Untitled'],
    yourName: ['ชื่อของคุณ', 'Your name'],
    copyEmail: ['คัดลอกอีเมล', 'Copy email'],
    copied: ['คัดลอกแล้ว', 'Copied'],
    copyFail: ['คัดลอกอัตโนมัติไม่ได้ เลือกข้อความไว้ให้แล้ว กดคัดลอกเองได้เลย', 'Couldn’t copy automatically. The text is selected, so copy it yourself.'],
    copy: ['คัดลอก', 'Copy'],
    close: ['ปิด', 'Close'],
    edit: ['แก้ไข', 'Edit'],
    del: ['ลบ', 'Delete'],
    confirmDelete: ['กดอีกครั้งเพื่อลบ', 'Tap again to delete'],
    editProfile: ['แก้ไขโปรไฟล์', 'Edit profile'],
    addWork: ['เพิ่มผลงาน', 'Add work'],
    editMode: ['โหมดแก้ไข', 'Edit mode'],
    editNote: ['กดบันทึกแล้วหน้าจะอัปเดตให้ทุกคนที่เปิดลิงก์ทันที', 'Saving updates the page for everyone with the link.'],
    storage: ['พื้นที่ที่ใช้ รวมรูปภาพ', 'Space used, including images'],
    doneEdit: ['ดูแบบผู้ชม', 'View as visitor'],
    obTitle: ['เริ่มใช้แฟ้มผลงานใน 3 ขั้น', 'Get started in 3 steps'],
    obHide: ['ซ่อน', 'Hide'],
    stepDone: ['เสร็จแล้ว', 'Done'],
    ob1: ['แก้โปรไฟล์ ใส่ชื่อจริง รูป และลิงก์ LinkedIn ของคุณ', 'Update your profile with your real name, a photo and your LinkedIn link.'],
    ob2: ['เพิ่มงาน KOL และใบเซอร์ อัปโหลดรูปหรือ PDF ได้เลย ระบบย่อขนาดให้เอง', 'Add KOL campaigns and certificates. Upload images or PDFs and they are resized for you.'],
    ob3: ['เปิดแชร์หน้านี้เป็นลิงก์สาธารณะ แล้วใน LinkedIn ไปที่ Add profile section → Add featured → Add a link แล้ววางลิงก์', 'Share this page as a public link, then in LinkedIn go to Add profile section → Add featured → Add a link and paste it.'],
    formNew: ['เพิ่มผลงาน', 'Add work'],
    formEdit: ['แก้ไขผลงาน', 'Edit work'],
    fCat: ['หมวด', 'Category'],
    fTitle: ['ชื่อผลงาน', 'Title'],
    thai: ['ไทย', 'Thai'],
    english: ['อังกฤษ', 'English'],
    fPeople: ['KOL / ช่องทาง', 'Creator / channel'],
    fPeoplePh: ['@ชื่อ KOL · TikTok', '@creator · TikTok'],
    fCredPh: ['เลขที่ใบเซอร์ ถ้ามี', 'If the certificate has one'],
    fRole: ['บทบาทของเรา', 'My role'],
    fDate: ['ช่วงเวลา', 'Date'],
    month: ['เดือน', 'Month'],
    year: ['ปี', 'Year'],
    yearPh: ['ค.ศ. หรือ พ.ศ.', 'e.g. 2026'],
    fStatus: ['สถานะ', 'Status'],
    fSummary: ['สรุปสั้น', 'Short summary'],
    sumHint: ['1–2 ประโยค แสดงบนการ์ด', 'One or two sentences, shown on the card'],
    fDetails: ['รายละเอียด', 'Details'],
    detHint: ['ขึ้นต้นบรรทัดด้วย • หรือ - เพื่อทำเป็นข้อ ๆ', 'Start a line with • or - to make a bullet'],
    fMetrics: ['ผลลัพธ์ที่วัดได้', 'Measurable results'],
    metricLabel: ['หัวข้อ', 'Label'],
    metricValue: ['ตัวเลข', 'Value'],
    addRow: ['เพิ่มแถว', 'Add row'],
    removeRow: ['ลบแถว', 'Remove row'],
    fTags: ['ทักษะ / เครื่องมือ', 'Skills / tools'],
    tagsHint: ['คั่นด้วยจุลภาค เช่น Canva, Excel, Influencer marketing', 'Separate with commas'],
    fLinks: ['ลิงก์', 'Links'],
    linkLabel: ['ชื่อลิงก์', 'Label'],
    fImages: ['รูปภาพและไฟล์', 'Images & files'],
    chooseFiles: ['เลือกไฟล์', 'Choose files'],
    orDrop: ['หรือลากรูป/PDF มาวางที่นี่', 'or drop images or PDFs here'],
    imgHint: ['รูปแรกคือปก · PDF จะแปลงหน้าแรกเป็นรูป · ย่อขนาดอัตโนมัติ', 'The first image is the cover. A PDF becomes an image of page 1. Images are resized automatically.'],
    processing: ['กำลังเตรียมไฟล์…', 'Preparing files…'],
    coverTag: ['ปก', 'Cover'],
    makeCover: ['ตั้งเป็นปก', 'Make cover'],
    removeImg: ['เอารูปออก', 'Remove image'],
    fFeatured: ['ปักหมุดไว้ด้านบน', 'Pin to the top'],
    enNudge: ['ช่องภาษาอังกฤษไม่บังคับ ถ้าเว้นว่างจะแสดงภาษาไทยแทน แต่ผู้ชมต่างชาติจาก LinkedIn จะอ่านได้ง่ายขึ้นถ้าใส่', 'English fields are optional. Thai is shown where English is left empty.'],
    cancel: ['ยกเลิก', 'Cancel'],
    save: ['บันทึกและเผยแพร่', 'Save and publish'],
    saving: ['กำลังบันทึก…', 'Saving…'],
    errTitle: ['ใส่ชื่อผลงานอย่างน้อยหนึ่งภาษา', 'Add a title in at least one language'],
    errYear: ['ปีไม่ถูกต้อง ใส่ตัวเลข 4 หลัก เช่น 2026 หรือ 2569', 'Enter a 4-digit year, such as 2026'],
    errLink: ['ลิงก์ต้องเป็นที่อยู่เว็บ เช่น https://…', 'Links must be web addresses, such as https://…'],
    errEmail: ['อีเมลไม่ครบ ตรวจอีกครั้ง', 'That email address looks incomplete'],
    errBusy: ['รอให้เตรียมไฟล์เสร็จก่อน', 'Wait for the files to finish preparing'],
    pTitle: ['แก้ไขโปรไฟล์', 'Edit profile'],
    pName: ['ชื่อที่แสดง', 'Display name'],
    pHeadline: ['ตำแหน่ง / คำอธิบายสั้น', 'Headline'],
    pBio: ['แนะนำตัว', 'About'],
    pLocation: ['ที่อยู่', 'Location'],
    pPhoto: ['รูปโปรไฟล์', 'Profile photo'],
    pChoose: ['เลือกรูป', 'Choose photo'],
    pRemove: ['ลบรูป', 'Remove photo'],
    pContact: ['ช่องทางติดต่อ', 'Contact'],
    pLinkedin: ['ลิงก์โปรไฟล์ LinkedIn', 'LinkedIn profile URL'],
    pEmail: ['อีเมล', 'Email'],
    pWebsite: ['เว็บไซต์อื่น', 'Other website'],
    pContactHint: ['ทุกคนที่เปิดลิงก์จะเห็นช่องทางเหล่านี้', 'Everyone with the link can see these'],
    saved: ['บันทึกและเผยแพร่แล้ว', 'Saved and published'],
    added: ['เพิ่มผลงานแล้ว', 'Work added'],
    deleted: ['ลบผลงานแล้ว', 'Work deleted'],
    conflict: ['มีเวอร์ชันใหม่กว่าถูกบันทึกก่อน หน้ากำลังโหลดใหม่ แก้ไขอีกครั้งได้เลย', 'A newer version was saved first. The page is reloading, so make your change again.'],
    readOnly: ['ลิงก์นี้เปิดแบบดูอย่างเดียว จึงบันทึกไม่ได้', 'This view is read-only, so changes can’t be saved.'],
    tooLarge: ['หน้านี้ใหญ่เกิน 16 MB เอารูปออกบางรูปแล้วลองใหม่', 'The page is over 16 MB. Remove some images and try again.'],
    rateLimited: ['บันทึกถี่เกินไป รอสักครู่แล้วกดบันทึกอีกครั้ง', 'Saving too often. Wait a moment, then save again.'],
    saveFailed: ['บันทึกไม่สำเร็จ ลองกดบันทึกอีกครั้ง', 'Couldn’t save. Try saving again.'],
    fileType: ['รองรับเฉพาะรูปภาพและ PDF', 'Only images and PDFs are supported'],
    pdfFail: ['เปิด PDF นี้ไม่ได้ ลองแคปหน้าจอเป็นรูปแทน', 'Couldn’t read that PDF. Upload a screenshot instead.'],
    imgFail: ['เปิดรูปนี้ไม่ได้ ลองไฟล์ JPG หรือ PNG', 'Couldn’t open that image. Try a JPG or PNG.'],
    results: ['ผลลัพธ์', 'Results'],
    skills: ['ทักษะและเครื่องมือ', 'Skills & tools'],
    links: ['ลิงก์', 'Links'],
    issued: ['วันที่ได้รับ', 'Issued'],
    when: ['ช่วงเวลา', 'Date'],
    liTitle: ['ข้อมูลสำหรับ LinkedIn', 'For LinkedIn'],
    liOnly: ['เห็นเฉพาะคุณ', 'Only you see this'],
    liCertHint: ['คัดลอกทีละช่องไปกรอกที่ Licenses & certifications', 'Copy each field into Licenses & certifications'],
    liProjHint: ['คัดลอกทีละช่องไปกรอกที่ Projects ในโปรไฟล์', 'Copy each field into the Projects section'],
    liKolHint: ['ร่างโพสต์ไว้ให้แล้ว แก้ได้ก่อนโพสต์ · สลับเป็น EN ด้านบนเพื่อได้ฉบับภาษาอังกฤษ', 'A draft post for LinkedIn. Switch the page to ไทย for a Thai version.'],
    copyPost: ['คัดลอกโพสต์', 'Copy post'],
    portfolioOf: ['แฟ้มผลงานของ', 'Portfolio of'],
    imageN: ['รูปที่', 'Image'],
    openApp: ['เปิดแอพ', 'Open app'],
    pinned: ['ปักหมุด', 'Pinned'],
    skillsLabel: ['ทักษะ', 'Skills'],
    skillFilter: ['กรองตามทักษะ', 'Filter by skill'],
    clearFilters: ['ล้างตัวกรอง', 'Clear filters'],
    directLink: ['ลิงก์ตรง', 'Direct link'],
    directHint: ['ต่อท้ายลิงก์หน้าแฟ้มผลงานด้วยข้อความนี้ เพื่อเปิดผลงานนี้ทันที ใช้ใส่ใน LinkedIn Featured ทีละผลงานได้', 'Add this to the end of your portfolio link to open this work directly, handy for LinkedIn Featured'],
    showSkill: ['ดูผลงานอื่นที่ใช้ทักษะนี้', 'See other work with this skill'],
    prevWork: ['ผลงานก่อนหน้า', 'Previous work'],
    nextWork: ['ผลงานถัดไป', 'Next work'],
    prevImg: ['รูปก่อนหน้า', 'Previous image'],
    nextImg: ['รูปถัดไป', 'Next image'],
    navKeys: ['เลื่อนดูผลงานอื่น', 'browse other work'],
    navSwipe: ['ปัดซ้าย–ขวาเพื่อดูผลงานถัดไป', 'Swipe left or right for more work'],
    saveWait: ['กำลังบันทึก รอสักครู่', 'Saving, one moment'],
    searchKey: ['กด / เพื่อค้นหา', 'Press / to search'],
    others: ['อื่น ๆ', 'Others'],
    pin: ['ปักหมุด', 'Pin'],
    unpin: ['เลิกปักหมุด', 'Unpin'],
    color: ['สีการ์ด', 'Card color'],
    noColor: ['ไม่มีสี', 'Default'],
    gripAria: ['ลากเพื่อจัดลำดับ หรือกดปุ่มลูกศรเพื่อย้าย', 'Drag to reorder, or use the arrow keys'],
    boardHint: ['ลากการ์ดเพื่อจัดลำดับ · บนมือถือให้ลากที่ปุ่มจุด · ปักหมุดเพื่อดันขึ้นด้านบน', 'Drag cards to reorder. On phones, drag by the dotted handle. Pin cards to keep them on top.'],
    viewLabel: ['มุมมอง', 'View'],
    viewGrid: ['มุมมองแบบบอร์ด', 'Board view'],
    viewList: ['มุมมองแบบรายการ', 'List view'],
    savePending: ['มีการเปลี่ยนแปลง · กำลังจะบันทึกอัตโนมัติ', 'Changes pending · saving automatically'],
    saveSaving: ['กำลังบันทึก…', 'Saving…'],
    saveError: ['บันทึกไม่สำเร็จ ลองขยับการ์ดอีกครั้ง', 'Couldn’t save. Move a card again to retry.'],
    orderSaved: ['จัดเรียงและบันทึกแล้ว', 'Layout saved'],
    download: ['ดาวน์โหลด HTML', 'Download HTML'],
    fileNote: ['โหมดไฟล์ · แก้เสร็จแล้วกดดาวน์โหลด HTML แล้วนำไฟล์ใหม่ไปแทนที่ไฟล์เดิม', 'File mode · download the updated HTML and replace the old file'],
    fileDirty: ['มีการเปลี่ยนแปลงที่ยังไม่ได้ดาวน์โหลด', 'Changes not downloaded yet'],
    fileSaved: ['อัปเดตแล้ว · อย่าลืมกดดาวน์โหลด HTML', 'Updated. Remember to download the HTML.'],
    fileModeOn: ['เปิดโหมดแก้ไขแบบไฟล์แล้ว', 'File edit mode is on'],
    downloaded: ['ดาวน์โหลดไฟล์แล้ว', 'File downloaded'],
    downloadData: ['ดาวน์โหลดข้อมูล', 'Download data'],
    fileNoteProj: ['โหมดแก้ไขในเครื่อง · แก้เสร็จกดดาวน์โหลดข้อมูล แล้วนำ portfolio.js ไปแทนที่ไฟล์ในโฟลเดอร์ data', 'Local edit mode · download the data and replace data/portfolio.js'],
    fileSavedProj: ['อัปเดตแล้ว · อย่าลืมกดดาวน์โหลดข้อมูล', 'Updated. Remember to download the data.'],
    ob3Proj: ['เอาโฟลเดอร์นี้ขึ้นเว็บ (Netlify, GitHub Pages หรือ Railway) แล้วใน LinkedIn ไปที่ Add profile section → Add featured → Add a link', 'Put this folder online (Netlify, GitHub Pages or Railway), then in LinkedIn go to Add profile section → Add featured → Add a link'],
    tryLive: ['ลองใช้ได้', 'Try it live'],
    watchDemo: ['ดูวิดีโอเดโม', 'Watch demo'],
    demoVideo: ['วิดีโอเดโม', 'Demo video'],
    tryHere: ['ลองเล่นแอพจริงตรงนี้', 'Try the real app right here'],
    tryHereSub: ['นี่คือแอพตัวจริงที่เปิดใช้งานอยู่ แตะ เลื่อน และกดได้เหมือนบนมือถือ', 'This is the live app. Tap, scroll and click just like on a phone.'],
    tryStart: ['แตะเพื่อเริ่ม', 'Tap to start'],
    allPosts: ['ผลลัพธ์รายโพสต์', 'Results by post'],
    nLikes: ['ไลก์', 'likes'],
    nSaves: ['เก็บ', 'saves'],
    nComments: ['คอมเมนต์', 'comments'],
    askFab: ['ถามเกี่ยวกับผลงาน', 'Ask about my work'],
    askHello: ['สวัสดี! ถามเรื่องผลงาน ทักษะ หรือแอพที่ลองเล่นได้ในหน้านี้ได้เลย', 'Hi! Ask about the work, the skills, or the apps you can try on this page.'],
    askPh: ['พิมพ์คำถาม…', 'Type a question…'],
    askSend: ['ส่งคำถาม', 'Send'],
    askNote: ['คำตอบมาจากข้อมูลในหน้านี้ และอาจผิดพลาดได้', 'Answers come from this page and may contain mistakes.'],
    askLocal: ['ตอบอัตโนมัติจากข้อมูลในหน้า', 'Auto-answer from page data'],
    askNoAnswer: ['ยังตอบคำถามนี้ไม่ได้ ลองถามเรื่องแอพ งาน KOL ทักษะ หรือแอพที่ลองเล่นได้', 'I can\'t answer that one yet. Try asking about the apps, the KOL work, skills, or what you can try.'],
    askNoContact: ['หน้านี้ยังไม่ได้ใส่ช่องทางติดต่อไว้', 'No contact details are listed on this page yet.'],
    newTab: ['เปิดในแท็บใหม่', 'Opens in a new tab'],
    fAppUrl: ['ลิงก์เปิดแอพ', 'App link'],
    appUrlHint: ['คนดูแฟ้มผลงานจะกดปุ่ม “เปิดแอพ” เพื่อลองใช้ได้ทันที · ต้องเปิดแชร์ตัวแอพเป็นลิงก์สาธารณะด้วย', 'Visitors tap “Open app” to try it. Share the app itself as a public link too.']
  };
  function t(k) { var v = STR[k]; return v ? (lang === 'en' ? v[1] : v[0]) : k; }
  function L(o) { return o ? (lang === 'en' ? o.en : o.th) : ''; }

  var ICON = {
    app: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    kol: '<path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1Z"/><path d="M16 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a8.5 8.5 0 0 1 0 12"/>',
    cert: '<circle cx="12" cy="9" r="5.5"/><path d="M8.6 13.4 7 21l5-2.5 5 2.5-1.6-7.6"/>',
    acad: '<path d="M12 6.5C10.5 5 8 4.5 4 4.5v14c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-14c-4 0-6.5.5-8 2Z"/><path d="M12 6.5v14"/>',
    other: '<path d="M3.5 7A1.5 1.5 0 0 1 5 5.5h4l2 2h8A1.5 1.5 0 0 1 20.5 9v8.5A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5Z"/>',
    all: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z"/>',
    pencil: '<path d="M14.5 5.5l4 4"/><path d="M4 20l1-4.5L16 4.5a2.1 2.1 0 0 1 3 3L8 18.5Z"/>',
    trash: '<path d="M4.5 7h15"/><path d="M9.5 7V5h5v2"/><path d="M6.5 7l1 12.5h9l1-12.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    ext: '<path d="M14 4.5h5.5V10"/><path d="M19.5 4.5 11 13"/><path d="M18 14v4.5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1H10"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
    upload: '<path d="M12 15V4.5"/><path d="m7.5 9 4.5-4.5L16.5 9"/><path d="M4.5 15v3.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V15"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.6 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.6-3.5-8.5s1-5.9 3.5-8.5Z"/>',
    user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5c1.2-3.3 3.8-5 7-5s5.8 1.7 7 5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    spark: '<path d="M12 3.5 13.9 10.1 20.5 12 13.9 13.9 12 20.5 10.1 13.9 3.5 12 10.1 10.1Z"/>',
    chevL: '<path d="m14.5 6-6 6 6 6"/>',
    chevR: '<path d="m9.5 6 6 6-6 6"/>',
    pushpin: '<path d="M9 4h6l-1 6 3 3v1H7v-1l3-3-1-6Z"/><path d="M12 14v6"/>',
    palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.9 1.8-1.8 0-1.1-.9-1.6-.9-2.6 0-1 .8-1.8 1.8-1.8h2.1a3.7 3.7 0 0 0 3.7-3.7c0-3.9-3.8-7.1-8.5-7.1Z"/><circle cx="7.8" cy="11" r="1.1"/><circle cx="10.5" cy="7.4" r="1.1"/><circle cx="15" cy="7.8" r="1.1"/>',
    grip: '<circle cx="9" cy="6" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/>',
    masonry: '<rect x="4" y="4" width="7" height="9" rx="1.5"/><rect x="13" y="4" width="7" height="5" rx="1.5"/><rect x="4" y="15" width="7" height="5" rx="1.5"/><rect x="13" y="11" width="7" height="9" rx="1.5"/>',
    list: '<rect x="4" y="4.5" width="16" height="6" rx="1.5"/><rect x="4" y="13.5" width="16" height="6" rx="1.5"/>',
    download: '<path d="M12 4.5V15"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4.5 19.5h15"/>',
    play: '<path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.6-6.8a.8.8 0 0 0 0-1.4L9.2 4.5A.8.8 0 0 0 8 5.2Z"/>',
    case: '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5"/><path d="M3.5 12.5h17"/>'
  };
  function icon(n, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (ICON[n] || '') + '</svg>';
  }

  /* ---------- helpers ---------- */
  function str(v) { return v == null ? '' : String(v); }
  function esc(s) { return str(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function bi(o) { if (typeof o === 'string') return { th: o, en: '' }; o = o || {}; return { th: str(o.th), en: str(o.en) }; }
  function pick(o) { if (!o) return ''; if (typeof o === 'string') return o; return (lang === 'en' ? (o.en || o.th) : (o.th || o.en)) || ''; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function safeUrl(u) {
    u = str(u).trim();
    if (!u) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return /^https?:\/\/[^\s]+$/i.test(u) ? u : '';
    if (/^\/\//.test(u)) return 'https:' + u;
    if (/\s/.test(u) || u.indexOf('.') < 0) return '';
    return 'https://' + u;
  }
  function safeImg(u) {
    u = str(u);
    if (/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+\/=]+$/.test(u)) return u;
    if (!INLINE && u.indexOf('..') < 0 && /^(images\/[A-Za-z0-9._\-\/]+\.(jpe?g|png|webp|gif)|https:\/\/[^\s"'<>()]+)$/i.test(u)) return u;
    return '';
  }
  function safeVideo(u) {
    u = str(u);
    if (/^data:video\/(mp4|webm);base64,[A-Za-z0-9+\/=]+$/.test(u)) return u;
    if (!INLINE && u.indexOf('..') < 0 && /^(images\/[A-Za-z0-9._\-\/]+|https:\/\/[^\s"'<>()]+)\.(mp4|webm)$/i.test(u)) return u;
    return '';
  }
  function hostOf(u) { var m = /^https?:\/\/(?:www\.)?([^\/?#]+)/i.exec(u); return m ? m[1] : u; }
  function newId() { return 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }
  function ssDel(k) { try { sessionStorage.removeItem(k); } catch (e) { } }
  function reduced() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function normDate(d) { d = str(d).trim(); return /^\d{4}(-(0[1-9]|1[0-2]))?$/.test(d) ? d : ''; }
  function splitDate(d) { var m = /^(\d{4})(?:-(\d{2}))?$/.exec(d || ''); return m ? { y: m[1], m: m[2] || '' } : { y: '', m: '' }; }
  function normYear(y) {
    y = str(y).replace(/\D/g, '');
    if (y.length !== 4) return null;
    var n = +y; if (n > 2400) n -= 543;
    return n >= 1950 && n <= 2100 ? String(n) : null;
  }
  function fmtDate(d, lg) {
    lg = lg || lang;
    var m = /^(\d{4})(?:-(\d{2}))?$/.exec(d || ''); if (!m) return '';
    var y = +m[1], mo = m[2] ? +m[2] : 0;
    if (lg === 'th') return (mo ? MONTHS.th[mo - 1] + ' ' : '') + (y + 543);
    return (mo ? MONTHS.en[mo - 1] + ' ' : '') + y;
  }
  function fmtDay(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); if (!m) return '';
    var y = +m[1], mo = +m[2], d = +m[3];
    return lang === 'th' ? d + ' ' + MONTHS.th[mo - 1] + ' ' + (y + 543) : d + ' ' + MONTHS.en[mo - 1] + ' ' + y;
  }
  function todayISO() { var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function byteLen(s) { try { return new Blob([s]).size; } catch (e) { return s.length * 2; } }
  function catName(c) { return c === 'all' ? t('all') : L(CAT[c].name); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------- state ---------- */
  function normItem(it) {
    if (!it || typeof it !== 'object') return null;
    return {
      id: str(it.id) || newId(),
      cat: CATS.indexOf(it.cat) >= 0 ? it.cat : 'other',
      featured: !!it.featured,
      title: bi(it.title), role: bi(it.role), summary: bi(it.summary), details: bi(it.details),
      org: str(it.org), people: str(it.people), credId: str(it.credId),
      appUrl: it.cat === 'app' ? safeUrl(it.appUrl) : '',
      embed: it.cat === 'app' && !!it.embed && !!safeUrl(it.appUrl),
      color: TINTS.indexOf(it.color) >= 0 ? it.color : '',
      date: normDate(it.date),
      status: STATUS[it.status] ? it.status : '',
      metrics: (Array.isArray(it.metrics) ? it.metrics : []).map(function (m) { return { k: str(m && m.k), v: str(m && m.v) }; }).filter(function (m) { return m.k || m.v; }),
      tags: (Array.isArray(it.tags) ? it.tags : []).map(str).filter(Boolean),
      links: (Array.isArray(it.links) ? it.links : []).map(function (l) { return { label: str(l && l.label), url: safeUrl(l && l.url) }; }).filter(function (l) { return l.url; }),
      images: (Array.isArray(it.images) ? it.images : []).map(str).filter(function (u) { return !!safeImg(u); }),
      video: safeVideo(it.video),
      clip: safeVideo(it.clip),
      posts: it.cat === 'kol' && Array.isArray(it.posts) ? it.posts.map(function (p) {
        p = p || {}; return { name: str(p.name), title: str(p.title), url: safeUrl(p.url), tag: str(p.tag), likes: Math.max(0, +p.likes || 0), saves: Math.max(0, +p.saves || 0), comments: Math.max(0, +p.comments || 0) };
      }).filter(function (p) { return p.url; }) : []
    };
  }
  function parseState() {
    var s = null;
    try { s = INLINE ? JSON.parse(textOf('pf-data')) : JSON.parse(JSON.stringify(window.PORTFOLIO_DATA || null)); } catch (e) { s = null; }
    if (!s || typeof s !== 'object') s = {};
    var p = s.profile && typeof s.profile === 'object' ? s.profile : {};
    s.profile = {
      name: str(p.name), headline: bi(p.headline), bio: bi(p.bio), location: bi(p.location),
      photo: safeImg(p.photo), linkedin: safeUrl(p.linkedin), email: str(p.email), website: safeUrl(p.website)
    };
    s.items = Array.isArray(s.items) ? s.items.map(normItem).filter(Boolean) : [];
    s.ai = { endpoint: safeUrl(s.ai && s.ai.endpoint) };
    s.updatedAt = /^\d{4}-\d{2}-\d{2}$/.test(str(s.updatedAt)) ? s.updatedAt : '';
    s.v = 1;
    return s;
  }
  function docTitle(st) { var n = str(st.profile.name).trim(); return n ? n + ' Portfolio' : 'Portfolio'; }
  function jsonForScript(st) { return JSON.stringify(st).replace(/</g, '\\u003c'); }
  function pageContent(st) {
    return '<title>' + esc(docTitle(st)) + '</title>' + HEAD_EXTRA +
      '<style id="pf-css">' + CSS_SRC + '</style>' +
      '<div id="app"></div>' +
      '<script type="application/json" id="pf-data">' + jsonForScript(st) + '</scr' + 'ipt>' +
      '<script id="pf-app">' + APP_SRC + '</scr' + 'ipt>';
  }
  function buildDoc(st) {
    return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>' + RESET + '</style></head><body>' + pageContent(st) + '</body></html>';
  }

  var state = parseState();
  if (!INLINE) { try { D.title = docTitle(state); } catch (e) { } }
  var lang = (function () { var s = lsGet('pf-lang'); if (s === 'th' || s === 'en') return s; return /^th/i.test(navigator.language || 'th') ? 'th' : 'en'; })();
  var filter = 'all', tagFilter = '';
  var view = lsGet('pf-view') === 'list' ? 'list' : 'grid';
  var fileMode = false, dirty = false, saveTimer = null, saveState = '', publishing = false, hoverCard = null;
  var query = '';
  var editing = false;
  var canWrite = false;
  var artifactNS = null, userNS = null, capsStarted = false;
  var app = D.getElementById('app');
  var dlg, toastEl, toastTimer, dlgClick = null, lastFocus = null, activeForm = null;

  function findItem(id) { for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) return state.items[i]; return null; }
  function countCat(c) { var n = 0; state.items.forEach(function (it) { if (it.cat === c) n++; }); return n; }
  function haystack(it) {
    return [it.title.th, it.title.en, it.summary.th, it.summary.en, it.org, it.people, it.role.th, it.role.en, it.tags.join(' '), catName(it.cat)].join(' ').toLowerCase();
  }
  function visibleItems() {
    var q = query.trim().toLowerCase();
    return state.items.filter(function (it) {
      if (filter !== 'all' && it.cat !== filter) return false;
      if (tagFilter && it.tags.indexOf(tagFilter) < 0) return false;
      return !q || haystack(it).indexOf(q) >= 0;
    });
  }

  /* ---------- rendering ---------- */
  function avatarHTML(p) {
    if (p.photo) return '<div class="avatar"><img src="' + p.photo + '" alt=""></div>';
    var chars = Array.from(str(p.name).trim());
    var ini = chars[0] || '•';
    if (/[เแโใไ]/.test(ini) && chars[1]) ini += chars[1];
    return '<div class="avatar" aria-hidden="true"><span>' + esc(ini.toUpperCase()) + '</span><span class="av-tabs"><i></i><i></i><i></i><i></i></span></div>';
  }

  function render() {
    D.documentElement.lang = lang;
    var h = '<div class="wrap' + (editing ? ' is-editing' : '') + '">';
    h += renderTop();
    if (editing) h += renderOnboard();
    h += renderCover();
    h += '<section class="binder" id="work" aria-labelledby="sheet-title">' +
      '<div class="tabs-scroll"><nav class="tabs" id="tabs" aria-label="' + esc(t('contents')) + '"></nav></div>' +
      '<div class="sheet" id="sheet"><div class="sheet-head"><h2 id="sheet-title"></h2>' +
      '<div class="sheet-tools"><label class="search">' + icon('search') + '<span class="sr">' + esc(t('search')) + '</span><input id="q" type="search" autocomplete="off" placeholder="' + esc(t('search')) + '" value="' + esc(query) + '"><kbd class="kbd" title="' + esc(t('searchKey')) + '">/</kbd></label>' +
      '<div class="view-toggle" role="group" aria-label="' + esc(t('viewLabel')) + '"><button type="button" data-act="view" data-view="grid" aria-pressed="' + (view === 'grid') + '" aria-label="' + esc(t('viewGrid')) + '" title="' + esc(t('viewGrid')) + '">' + icon('masonry') + '</button><button type="button" data-act="view" data-view="list" aria-pressed="' + (view === 'list') + '" aria-label="' + esc(t('viewList')) + '" title="' + esc(t('viewList')) + '">' + icon('list') + '</button></div></div></div>' +
      '<div class="skills-scroll" id="skills-wrap"><div class="skills" id="skills" role="group" aria-label="' + esc(t('skillFilter')) + '"></div></div><div id="grid"></div></div></section>';
    h += '<footer class="foot"><span>' + esc(t('portfolioOf')) + ' ' + esc(state.profile.name || '') + '</span>' + (state.updatedAt ? '<span>' + esc(t('updated')) + ' ' + esc(fmtDay(state.updatedAt)) + '</span>' : '') + '</footer>';
    h += '</div>';
    if (editing) h += renderEditBar();
    app.innerHTML = h;
    D.body.classList.toggle('has-editbar', editing);
    if (editing) setSaveState(saveState);
    renderSheet(false);
    renderAsk();
  }

  function renderTop() {
    var h = '<header class="top"><div class="mark"><span class="mark-tabs" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>' + esc(t('brand')) + '</span></div><div class="top-actions">';
    h += '<button type="button" class="btn btn-ghost lang-btn" data-act="lang" aria-label="' + esc(t('langAria')) + '">' + (lang === 'th' ? 'EN' : 'ไทย') + '</button>';
    if (canWrite) h += '<button type="button" class="btn edit-toggle" data-act="toggle-edit" aria-pressed="' + editing + '">' + icon('pencil') + '<span>' + esc(editing ? t('editOn') : t('editOff')) + '</span></button>';
    return h + '</div></header>';
  }

  function renderOnboard() {
    if (lsGet('pf-ob-hide') === '1') return '';
    var p = state.profile;
    var s1 = !!p.linkedin, s2 = countCat('kol') + countCat('cert') > 0;
    function step(n, done, text, acts) {
      return '<li class="' + (done ? 'done' : '') + '"><span class="step-n">' + (done ? icon('check') : '') + '0' + n + (done ? ' · ' + esc(t('stepDone')) : '') + '</span><p>' + esc(text) + '</p>' + (acts ? '<div class="step-acts">' + acts + '</div>' : '') + '</li>';
    }
    var h = '<section class="onboard" aria-labelledby="ob-t"><div class="onboard-head"><h2 id="ob-t">' + esc(t('obTitle')) + '</h2><button type="button" class="btn btn-ghost btn-sm" data-act="ob-hide">' + esc(t('obHide')) + '</button></div><ol class="steps">';
    h += step(1, s1, t('ob1'), '<button type="button" class="btn btn-sm" data-act="profile">' + icon('user') + esc(t('editProfile')) + '</button>');
    h += step(2, s2, t('ob2'), '<button type="button" class="btn btn-sm" data-act="add" data-cat="kol">' + icon('kol') + esc(L(CAT.kol.add)) + '</button><button type="button" class="btn btn-sm" data-act="add" data-cat="cert">' + icon('cert') + esc(L(CAT.cert.add)) + '</button>');
    h += step(3, false, t(INLINE ? 'ob3' : 'ob3Proj'), '');
    return h + '</ol></section>';
  }

  function renderCover() {
    var p = state.profile;
    var h = '<section class="cover-sheet"><div class="profile">' + avatarHTML(p) + '<div class="pinfo">';
    var nm = p.name || t('yourName');
    // Longest word length lets CSS shrink long names to fit instead of breaking mid-word.
    var lw = str(nm).split(/\s+/).reduce(function (m, w) { return Math.max(m, Array.from(w).length); }, 1);
    h += '<h1 class="name" style="--lw:' + lw + '">' + esc(nm) + '</h1>';
    var hl = pick(p.headline); if (hl) h += '<p class="headline">' + esc(hl) + '</p>';
    var bio = pick(p.bio); if (bio) h += '<p class="bio">' + esc(bio) + '</p>';
    var c = '';
    var loc = pick(p.location); if (loc) c += '<span class="loc">' + icon('pin') + esc(loc) + '</span>';
    if (p.linkedin) c += '<a class="btn btn-primary" href="' + esc(p.linkedin) + '" target="_blank" rel="noopener noreferrer">' + icon('case') + '<span>LinkedIn</span>' + icon('ext') + '</a>';
    if (p.email) c += '<span class="email-pill">' + icon('mail') + '<span id="pf-email">' + esc(p.email) + '</span><button type="button" class="icon-btn" data-act="copy" data-target="pf-email" aria-label="' + esc(t('copyEmail')) + '">' + icon('copy') + '</button></span>';
    if (p.website) c += '<a class="btn" href="' + esc(p.website) + '" target="_blank" rel="noopener noreferrer">' + icon('globe') + '<span>' + esc(hostOf(p.website)) + '</span></a>';
    if (c) h += '<div class="contacts">' + c + '</div>';
    if (editing) h += '<div><button type="button" class="btn btn-sm" data-act="profile">' + icon('pencil') + esc(t('editProfile')) + '</button></div>';
    h += '</div></div>';
    h += renderIndex();
    return h + '</section>';
  }

  function renderIndex() {
    var h = '<aside class="index" aria-labelledby="ix-t"><div class="index-head"><h2 id="ix-t">' + esc(t('contents')) + '</h2><span>' + state.items.length + ' ' + esc(t('itemsUnit')) + '</span></div><ul>';
    CATS.forEach(function (c) {
      var n = countCat(c);
      if (!n && !editing) return;
      h += '<li><button type="button" class="index-row' + (n ? '' : ' zero') + '" data-act="jump" data-cat="' + c + '"><span class="dot" data-cat="' + c + '"></span><span>' + esc(catName(c)) + '</span><span class="leader" aria-hidden="true"></span><span class="num">' + pad2(n) + '</span></button></li>';
    });
    h += '</ul>';
    if (state.updatedAt) h += '<div class="index-foot"><span>' + esc(t('updated')) + '</span><span>' + esc(fmtDay(state.updatedAt)) + '</span></div>';
    return h + '</aside>';
  }

  /* ---------- generative covers (cards without images) ---------- */
  function hashStr(x) { var h = 2166136261; for (var i = 0; i < x.length; i++) { h ^= x.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return function () { seed = (seed + 0x6D2B79F5) | 0; var q = Math.imul(seed ^ (seed >>> 15), 1 | seed); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; }; }
  function initialOf(it) {
    var chars = Array.from(str(it.title.en || it.title.th).trim()), ini = chars[0] || '•';
    if (/[เแโใไ]/.test(ini) && chars[1]) ini += chars[1];
    return ini.toUpperCase();
  }
  function genCover(it, W, H) {
    var r = rng(hashStr(it.id + '|' + it.cat)), kind = Math.floor(r() * 4), sh = '', i, k;
    W = W || 320; H = H || (112 + Math.floor(r() * 48));
    var x0 = W * 0.42, f = function (v) { return v.toFixed(1); };
    if (kind === 0) {
      var cx = x0 + (W - x0) * (0.45 + r() * 0.3), cy = H * (0.35 + r() * 0.35);
      for (k = 0; k < 6; k++) sh += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + (18 + k * 17) + '" fill="none" stroke="currentColor" stroke-width="1.6" opacity="' + (0.6 - k * 0.08).toFixed(2) + '"' + (k % 2 ? ' stroke-dasharray="3 6"' : '') + '/>';
      sh += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="6" fill="currentColor"/>';
    } else if (kind === 1) {
      for (var y = 14; y < H - 6; y += 15) for (var x = x0; x < W - 6; x += 15) { var big = r() < 0.1; sh += '<circle cx="' + f(x) + '" cy="' + y + '" r="' + (big ? 3.6 : 1.5) + '" fill="currentColor" opacity="' + (big ? 0.75 : 0.28) + '"/>'; }
    } else if (kind === 2) {
      var n = Math.floor((W - x0 - 16) / 20), bw = 13;
      for (i = 0; i < n; i++) { var bh = 16 + r() * (H - 42); sh += '<rect x="' + f(x0 + i * 20) + '" y="' + f(H - 14 - bh) + '" width="' + bw + '" height="' + f(bh) + '" rx="3" fill="currentColor" opacity="' + (0.22 + r() * 0.5).toFixed(2) + '"/>'; }
    } else {
      var pts = [], m = 7;
      for (i = 0; i <= m; i++) pts.push(f(x0 + (W - x0 - 10) * i / m) + ',' + f(H * (0.25 + r() * 0.5)));
      sh += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" opacity=".8"/>';
      pts.forEach(function (pt, j) { if (j % 2 === 0) { var xy = pt.split(','); sh += '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="3.4" fill="currentColor"/>'; } });
      sh += '<line x1="' + f(x0) + '" y1="' + (H - 14) + '" x2="' + (W - 10) + '" y2="' + (H - 14) + '" stroke="currentColor" stroke-width="1" opacity=".35"/>';
    }
    var fs = Math.round(Math.min(H * 0.62, 92));
    return '<svg class="gen-svg" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' + sh + '<text x="18" y="' + (H - 16) + '" class="gen-initial" style="font-size:' + fs + 'px">' + esc(initialOf(it)) + '</text></svg>';
  }
  function renderSkills() {
    var box = D.getElementById('skills'), wrap = D.getElementById('skills-wrap'); if (!box) return;
    var counts = {};
    state.items.forEach(function (it) { if (filter !== 'all' && it.cat !== filter) return; it.tags.forEach(function (g) { counts[g] = (counts[g] || 0) + 1; }); });
    var top = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); }).slice(0, 14);
    if (tagFilter && top.indexOf(tagFilter) < 0) top.unshift(tagFilter);
    wrap.hidden = top.length < 2;
    box.innerHTML = top.length < 2 ? '' : '<span class="skills-label">' + icon('spark') + esc(t('skillsLabel')) + '</span>' + top.map(function (g) {
      return '<button type="button" class="skill" data-act="skill" data-tag="' + esc(g) + '" aria-pressed="' + (tagFilter === g) + '">' + esc(g) + '<span class="n">' + (counts[g] || 0) + '</span></button>';
    }).join('');
  }

  function renderSheet(animate) {
    var tabs = D.getElementById('tabs'), grid = D.getElementById('grid'), title = D.getElementById('sheet-title'), sheet = D.getElementById('sheet');
    if (!tabs) return;
    var cats = ['all'].concat(CATS.filter(function (c) { return editing || countCat(c) > 0; }));
    if (cats.indexOf(filter) < 0) filter = 'all';
    tabs.innerHTML = cats.map(function (c) {
      var n = c === 'all' ? state.items.length : countCat(c);
      return '<button type="button" class="tab" data-act="filter" data-cat="' + c + '" aria-pressed="' + (filter === c) + '"><span>' + esc(catName(c)) + '</span><span class="n">' + n + '</span></button>';
    }).join('');
    sheet.setAttribute('data-cat', filter);
    title.innerHTML = icon(filter) + '<span>' + esc(filter === 'all' ? t('allWork') : catName(filter)) + '</span>';
    Array.prototype.forEach.call(D.querySelectorAll('[data-act="view"]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === view)); });
    renderSkills();
    var old = animate && !reduced() ? snapRects() : null;
    var list = visibleItems(), h = '';
    if (!list.length) {
      grid.className = '';
      if (query.trim() || tagFilter) h = '<div class="empty" data-cat="all">' + icon('search') + '<h3>' + esc(t('noResults')) + '</h3><button type="button" class="btn" data-act="clear-filters">' + esc(t('clearFilters')) + '</button></div>';
      else if (editing && filter !== 'all') h = emptyOwner(filter);
      else if (editing) h = '<div class="empty" data-cat="all">' + icon('all') + '<h3>' + esc(t('emptyPublic')) + '</h3><button type="button" class="btn btn-primary" data-act="add" data-cat="">' + icon('plus') + esc(t('addWork')) + '</button></div>';
      else h = '<div class="empty" data-cat="' + filter + '">' + icon(filter) + '<h3>' + esc(t('emptyPublic')) + '</h3></div>';
      grid.innerHTML = h;
      return;
    }
    grid.className = 'boards' + (view === 'list' ? ' is-list' : '');
    var pinned = list.filter(function (it) { return it.featured; }), rest = list.filter(function (it) { return !it.featured; });
    var addTile = editing && !query.trim() && !tagFilter ? '<button type="button" class="mcard is-add" data-act="add" data-cat="' + (filter === 'all' ? '' : filter) + '">' + icon('plus') + '<span>' + esc(filter === 'all' ? t('addWork') : L(CAT[filter].add)) + '</span></button>' : '';
    if (editing) h += '<p class="board-hint">' + icon('grip') + '<span>' + esc(t('boardHint')) + '</span></p>';
    if (pinned.length) h += '<div class="board-label">' + icon('pushpin') + '<span>' + esc(t('pinned')) + '</span></div><div class="masonry" data-group="pin">' + pinned.map(cardHTML).join('') + '</div>';
    if (rest.length || addTile) {
      if (pinned.length) h += '<div class="board-label"><span>' + esc(t('others')) + '</span></div>';
      h += '<div class="masonry" data-group="rest">' + rest.map(cardHTML).join('') + addTile + '</div>';
    }
    grid.innerHTML = h;
    mountBoards(old);
    syncClips(grid);
  }

  // Card preview clips: play on hover where there is a mouse, and while mostly on screen on touch screens.
  var clipIO = null;
  function playClip(v, on) {
    if (!v) return;
    if (on) { var p = v.play(); if (p && p.catch) p.catch(function () {}); return; }
    v.pause(); var card = v.closest('.mcard'); if (card) card.classList.remove('clip-on');
  }
  function syncClips(root) {
    var vids = root.querySelectorAll('video.mclip');
    if (!vids.length || reduced()) return;
    Array.prototype.forEach.call(vids, function (v) { v.addEventListener('playing', function () { var card = v.closest('.mcard'); if (card) card.classList.add('clip-on'); }); });
    if (matchMedia('(hover: hover)').matches || !('IntersectionObserver' in window)) return;
    if (clipIO) clipIO.disconnect();
    clipIO = new IntersectionObserver(function (es) { es.forEach(function (e) { playClip(e.target, e.intersectionRatio >= 0.6); }); }, { threshold: [0, 0.6] });
    Array.prototype.forEach.call(vids, function (v) { clipIO.observe(v); });
  }
  function clipCard(e) {
    if (e.pointerType !== 'mouse' || reduced()) return null;
    var card = e.target.closest && e.target.closest('.mcard');
    return card && !(e.relatedTarget && card.contains(e.relatedTarget)) ? card : null;
  }
  D.addEventListener('pointerover', function (e) { var card = clipCard(e); if (card) playClip(card.querySelector('video.mclip'), true); });
  D.addEventListener('pointerout', function (e) { var card = clipCard(e), v = card && card.querySelector('video.mclip'); if (v) { playClip(v, false); v.currentTime = 0; } });

  /* ---------- ask panel: AI answers through state.ai.endpoint, local answers from the page data when that is unavailable ---------- */
  var askOpen = false, askMsgs = [], askBusy = false, askEl = null;
  function askSuggest() {
    return lang === 'en' ? ['Which apps use AI?', 'How did the KOL campaign do?', 'Which apps can I try?', 'What are the main skills?'] : ['แอพไหนใช้ AI บ้าง?', 'งาน KOL ได้ผลยังไง?', 'แอพไหนลองเล่นได้บ้าง?', 'ทักษะหลักมีอะไรบ้าง?'];
  }
  function askTextHTML(s) {
    var out = '', list = false;
    str(s).split('\n').forEach(function (ln) {
      var m = /^\s*(?:[-•*]|\d+\.)\s+(.*)$/.exec(ln);
      if (m) { if (!list) { out += '<ul>'; list = true; } out += '<li>' + esc(m[1]) + '</li>'; return; }
      if (list) { out += '</ul>'; list = false; }
      if (ln.trim()) out += '<p>' + esc(ln) + '</p>';
    });
    return out + (list ? '</ul>' : '');
  }
  function askMsgHTML(m) {
    if (m.r === 'u') return '<div class="ask-msg u">' + esc(m.t) + '</div>';
    var h = '<div class="ask-msg a">' + askTextHTML(m.t);
    if (m.ids && m.ids.length) h += '<div class="ask-open">' + m.ids.map(function (id) { var it = findItem(id); return it ? '<button type="button" class="chip" data-ask="open" data-id="' + esc(id) + '">' + icon(it.cat) + esc(pick(it.title)) + '</button>' : ''; }).join('') + '</div>';
    if (m.local) h += '<span class="ask-tag">' + esc(t('askLocal')) + '</span>';
    return h + '</div>';
  }
  function renderAsk() {
    if (!askEl) { askEl = D.createElement('div'); askEl.id = 'ask'; D.body.appendChild(askEl); askEl.addEventListener('click', askClick); askEl.addEventListener('submit', askSubmit); }
    if (editing || !state.items.length) { askEl.innerHTML = ''; return; }
    var h = '<button type="button" class="ask-fab" data-ask="toggle" aria-expanded="' + askOpen + '" aria-controls="ask-panel">' + icon(askOpen ? 'x' : 'spark') + '<span>' + esc(t('askFab')) + '</span></button>';
    if (askOpen) {
      h += '<section class="ask-panel" id="ask-panel" aria-label="' + esc(t('askFab')) + '"><header class="ask-head"><b>' + icon('spark') + esc(t('askFab')) + '</b><button type="button" class="icon-btn" data-ask="toggle" aria-label="' + esc(t('close')) + '">' + icon('x') + '</button></header>';
      h += '<div class="ask-log" id="ask-log" aria-live="polite">' + (askMsgs.length ? '' : '<p class="ask-hello">' + esc(t('askHello')) + '</p>') + askMsgs.map(askMsgHTML).join('');
      if (askBusy) h += '<div class="ask-msg a ask-typing" aria-hidden="true"><i></i><i></i><i></i></div>';
      h += '</div>';
      if (!askMsgs.length) h += '<div class="ask-chips">' + askSuggest().map(function (s) { return '<button type="button" class="chip" data-ask="q" data-q="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</div>';
      h += '<form class="ask-form"><input id="ask-q" type="text" maxlength="300" autocomplete="off" aria-label="' + esc(t('askPh')) + '" placeholder="' + esc(t('askPh')) + '"' + (askBusy ? ' disabled' : '') + '><button type="submit" class="btn btn-primary" aria-label="' + esc(t('askSend')) + '"' + (askBusy ? ' disabled' : '') + '>' + icon('chevR') + '</button></form>';
      h += '<p class="ask-note">' + esc(t('askNote')) + '</p></section>';
    }
    askEl.innerHTML = h;
    var log = D.getElementById('ask-log'); if (log) log.scrollTop = log.scrollHeight;
  }
  function askFocus() { var inp = D.getElementById('ask-q'); if (inp && !inp.disabled) inp.focus(); }
  function askClick(e) {
    var b = e.target.closest('[data-ask]'); if (!b) return;
    var a = b.getAttribute('data-ask');
    if (a === 'toggle') { askOpen = !askOpen; renderAsk(); if (askOpen) askFocus(); else { var f = askEl.querySelector('.ask-fab'); if (f) f.focus(); } }
    else if (a === 'q') ask(b.getAttribute('data-q'));
    else if (a === 'open') openDetail(b.getAttribute('data-id'), {});
  }
  function askSubmit(e) {
    e.preventDefault();
    var inp = D.getElementById('ask-q'), q = inp ? inp.value.trim() : '';
    if (q) ask(q);
  }
  function ask(q) {
    if (askBusy) return;
    q = str(q).slice(0, 300);
    var hist = askMsgs.slice(-6).map(function (m) { return { r: m.r, t: str(m.t).slice(0, 600) }; });
    askMsgs.push({ r: 'u', t: q }); askBusy = true; renderAsk();
    function done(text, local, ids) {
      askBusy = false;
      askMsgs.push({ r: 'a', t: text, local: local, ids: ids || mentionedIds(text) });
      renderAsk(); askFocus();
    }
    function fallback() { var r = localAnswer(q); done(r.t, true, r.ids); }
    var ep = state.ai.endpoint;
    if (!ep || !window.fetch) { setTimeout(fallback, 300); return; }
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
    fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: q, history: hist, lang: qLang(q) }), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (j) { clearTimeout(timer); var ans = str(j && j.answer).trim(); if (!ans) throw new Error('empty'); done(ans, false); })
      .catch(function () { clearTimeout(timer); fallback(); });
  }
  // Works whose title (or the first words of it) appear in a piece of text, at most three.
  function mentionedIds(text) {
    var s = str(text).toLowerCase(), out = [];
    state.items.forEach(function (it) {
      var en = str(it.title.en).toLowerCase(), th = str(it.title.th).toLowerCase().replace(/^(แอพ|แอป)\s*/, '');
      var names = [en, th, en.split(/\s+/).slice(0, 2).join(' '), en.split(/\s+/)[0], th.split(/\s+/)[0]].filter(function (n) { return n.length >= 4; });
      if (names.some(function (n) { return s.indexOf(n) >= 0; }) && out.length < 3) out.push(it.id);
    });
    return out;
  }
  // Answers common questions straight from the page data, used when the AI endpoint is missing or unavailable.
  // It replies in the language of the question, whatever language the page is showing.
  function qLang(q) { return /[฀-๿]/.test(q) ? 'th' : /[a-z]/i.test(q) ? 'en' : lang; }
  function localAnswer(q) {
    var saved = lang;
    lang = qLang(q);
    try { return localAnswerIn(q); } finally { lang = saved; }
  }
  var STOP = ['what', 'which', 'when', 'where', 'there', 'their', 'this', 'that', 'with', 'from', 'your', 'about', 'does', 'have', 'they', 'them', 'then', 'than', 'will', 'would', 'could', 'should', 'into', 'like', 'more', 'tell', 'some', 'many', 'much', 'please'];
  function localAnswerIn(q) {
    var s = str(q).toLowerCase(), en = lang === 'en', items = state.items, p = state.profile;
    function has(words) { return words.some(function (w) { return /^[a-z]/.test(w) ? new RegExp('\\b' + w + '\\b').test(s) : s.indexOf(w) >= 0; }); }
    function line(it, extra) { return '- ' + pick(it.title) + ': ' + (extra || pick(it.summary)); }
    function ids(list) { return list.slice(0, 3).map(function (it) { return it.id; }); }
    var named = items.filter(function (it) { return mentionedIds(s).indexOf(it.id) >= 0; });
    if (named.length === 1) {
      var one = named[0], det = pick(one.details).split('\n').filter(Boolean).slice(0, 4).join('\n');
      return { t: pick(one.summary) + (det ? '\n' + det : ''), ids: [one.id] };
    }
    if (has(['kol', 'rednote', 'xiaohongshu', '小红书', 'campaign', 'influencer', 'แคมเปญ', 'อินฟลู', 'รีวิว'])) {
      var kol = items.filter(function (it) { return it.cat === 'kol'; });
      if (kol.length) return { t: kol.map(function (it) { return pick(it.title) + '\n' + pick(it.summary) + (it.metrics.length ? '\n' + it.metrics.map(function (m) { return '- ' + m.k + ': ' + m.v; }).join('\n') : ''); }).join('\n\n'), ids: ids(kol) };
    }
    if (has(['contact', 'email', 'linkedin', 'hire', 'reach', 'ติดต่อ', 'อีเมล', 'จ้าง'])) {
      var c = [p.linkedin && 'LinkedIn: ' + p.linkedin, p.email && (en ? 'Email: ' : 'อีเมล: ') + p.email, p.website && (en ? 'Website: ' : 'เว็บไซต์: ') + p.website].filter(Boolean);
      return { t: c.length ? c.join('\n') : t('askNoContact'), ids: [] };
    }
    if (has(['try', 'demo', 'play', 'live', 'link', 'open', 'ลอง', 'เล่น', 'เดโม', 'ลิงก์', 'เปิด'])) {
      var live = items.filter(function (it) { return it.appUrl || it.video; });
      if (live.length) return { t: (en ? 'You can try these:' : 'ลองได้เลยตามนี้:') + '\n' + live.map(function (it) { return line(it, it.appUrl ? (en ? 'open the live app at ' : 'เปิดแอพจริงได้ที่ ') + hostOf(it.appUrl) : (en ? 'watch the demo video on its page' : 'ดูวิดีโอเดโมได้ในหน้ารายละเอียด')); }).join('\n'), ids: ids(live) };
    }
    if (has(['ai', 'llm', 'gpt', 'claude', 'ollama', 'เอไอ', 'ปัญญาประดิษฐ์'])) {
      var ai = items.filter(function (it) { return it.tags.some(function (g) { return /\bai\b|ollama|openrouter|llm/i.test(g); }); });
      if (ai.length) return { t: (en ? 'These use AI:' : 'ผลงานที่ใช้ AI:') + '\n' + ai.map(function (it) { return line(it); }).join('\n'), ids: ids(ai) };
    }
    if (has(['skill', 'skills', 'tool', 'tools', 'tech', 'stack', 'ทักษะ', 'เครื่องมือ', 'เทคโนโลยี', 'ถนัด'])) {
      var count = {};
      items.forEach(function (it) { it.tags.forEach(function (g) { count[g] = (count[g] || 0) + 1; }); });
      var top = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; }).slice(0, 12);
      if (top.length) return { t: (en ? 'Skills and tools used across the work: ' : 'ทักษะและเครื่องมือที่ใช้ในผลงาน: ') + top.join(', '), ids: [] };
    }
    if (has(['who', 'about', 'background', 'study', 'student', 'ใคร', 'ประวัติ', 'เรียน', 'แนะนำตัว'])) {
      return { t: [p.name, pick(p.headline), pick(p.bio)].filter(Boolean).join('\n'), ids: [] };
    }
    if (has(['app', 'apps', 'project', 'projects', 'work', 'portfolio', 'แอพ', 'แอป', 'ผลงาน', 'โปรเจกต์', 'เว็บ'])) {
      return { t: items.map(function (it) { return line(it); }).join('\n'), ids: ids(items) };
    }
    var words = s.split(/[^a-z0-9฀-๿]+/).filter(function (w) { return w.length > 3 && STOP.indexOf(w) < 0; });
    var scored = items.map(function (it) { var hay = haystack(it) + ' ' + str(it.details.th + ' ' + it.details.en).toLowerCase(); return { it: it, n: words.filter(function (w) { return hay.indexOf(w) >= 0; }).length }; })
      .filter(function (x) { return x.n > 0; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 2);
    if (scored.length) return { t: scored.map(function (x) { return line(x.it); }).join('\n'), ids: scored.map(function (x) { return x.it.id; }) };
    return { t: t('askNoAnswer'), ids: [] };
  }

  function emptyOwner(c) {
    return '<div class="empty" data-cat="' + c + '">' + icon(c) + '<h3>' + esc(L(CAT[c].none)) + '</h3><p>' + esc(L(CAT[c].empty)) + '</p><button type="button" class="btn btn-primary" data-act="add" data-cat="' + c + '">' + icon('plus') + esc(L(CAT[c].add)) + '</button></div>';
  }

  function kpiHTML(m) { return '<div class="kpi"><b' + (/^\d[\d,]*$/.test(m.v) ? ' data-count="' + esc(m.v) + '"' : '') + '>' + esc(m.v || '—') + '</b><span>' + esc(m.k) + '</span></div>'; }
  // Plain numbers in the detail view count up from zero once, when the dialog opens.
  function countUp(root) {
    if (reduced() || !window.requestAnimationFrame) return;
    var els = root.querySelectorAll('[data-count]'), t0 = null, DUR = 1100;
    if (!els.length) return;
    var targets = Array.prototype.map.call(els, function (el) { return +el.getAttribute('data-count').replace(/,/g, ''); });
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / DUR), ease = 1 - Math.pow(1 - k, 3);
      Array.prototype.forEach.call(els, function (el, i) { el.textContent = Math.round(targets[i] * ease).toLocaleString('en-US'); });
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function postsHTML(posts) {
    var list = posts.slice().sort(function (a, b) { return b.likes - a.likes; }), max = list[0].likes || 1;
    return '<div class="d-sec"><h3>' + esc(t('allPosts')) + '</h3><ol class="posts">' + list.map(function (p, i) {
      return '<li><a class="post-row" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer"><span class="p-rank">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="p-main"><b>' + esc(p.title || p.name) + '</b><span class="p-meta">' + (p.tag ? '<em>' + esc(p.tag) + '</em>' : '') + '@' + esc(p.name) + ' · ' + p.saves.toLocaleString('en-US') + ' ' + esc(t('nSaves')) + ' · ' + p.comments.toLocaleString('en-US') + ' ' + esc(t('nComments')) + '</span></span>' +
        '<span class="p-bar"><i style="--w:' + Math.round(p.likes / max * 100) + '%"></i><b data-count="' + p.likes + '">' + p.likes.toLocaleString('en-US') + '</b></span>' + icon('ext') + '</a></li>';
    }).join('') + '</ol></div>';
  }
  function statusHTML(s) { return STATUS[s] ? '<span class="status ' + s + '">' + esc(L(STATUS[s])) + '</span>' : ''; }

  function cardHTML(it) {
    var c = it.cat, title = pick(it.title) || t('untitled'), img = it.images[0], id = esc(it.id);
    var h = '<article class="mcard' + (it.color ? ' tint-' + it.color : '') + '" data-cat="' + c + '" data-id="' + id + '">';
    var pill = it.appUrl ? '<span class="live-pill">' + esc(t('tryLive')) + '</span>' : it.video ? '<span class="live-pill">' + esc(t('watchDemo')) + '</span>' : '';
    var clip = it.clip && !editing ? '<video class="mclip" src="' + it.clip + '" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video>' : '';
    if (img) h += '<div class="mcover' + (c === 'cert' ? ' contain' : '') + '"><img src="' + img + '" alt="" decoding="async">' + clip + pill + '</div>';
    else h += '<div class="mgen' + (c === 'cert' ? ' cert-gen' : '') + '">' + genCover(it) + '<span class="gen-ic-sm">' + icon(c) + '</span>' + pill + '</div>';
    if (editing) {
      h += '<div class="mtools"><button type="button" class="tool grip" data-act="grip" aria-label="' + esc(t('gripAria') + ': ' + title) + '" title="' + esc(t('gripAria')) + '">' + icon('grip') + '</button><span class="grow"></span>' +
        '<button type="button" class="tool" data-act="pin" data-id="' + id + '" aria-pressed="' + it.featured + '" aria-label="' + esc((it.featured ? t('unpin') : t('pin')) + ': ' + title) + '" title="' + esc(it.featured ? t('unpin') : t('pin')) + '">' + icon('pushpin') + '</button>' +
        '<button type="button" class="tool" data-act="palette" data-id="' + id + '" aria-expanded="false" aria-label="' + esc(t('color') + ': ' + title) + '" title="' + esc(t('color')) + '">' + icon('palette') + '</button>' +
        '<button type="button" class="tool" data-act="edit" data-id="' + id + '" aria-label="' + esc(t('edit') + ': ' + title) + '" title="' + esc(t('edit')) + '">' + icon('pencil') + '</button></div>';
    }
    h += '<div class="card-body"><div class="card-meta"><span class="cat-chip">' + icon(c) + esc(catName(c)) + '</span>' + (it.date ? '<span class="date">' + esc(fmtDate(it.date)) + '</span>' : '') + '</div>';
    h += '<h3><button type="button" class="card-link" data-act="open" data-id="' + id + '">' + esc(title) + '</button></h3>';
    var orgLine = [c === 'kol' ? it.people : '', it.org].filter(Boolean).join(' · ');
    if (orgLine) h += '<p class="org">' + esc(orgLine) + '</p>';
    var sum = pick(it.summary); if (sum) h += '<p class="sum">' + esc(sum) + '</p>';
    if (it.metrics.length) h += '<div class="kpis">' + it.metrics.slice(0, 2).map(kpiHTML).join('') + '</div>';
    var foot = c === 'app' ? statusHTML(it.status) : '';
    it.tags.slice(0, 3).forEach(function (g) { foot += '<span class="tag">' + esc(g) + '</span>'; });
    if (it.tags.length > 3) foot += '<span class="tag">+' + (it.tags.length - 3) + '</span>';
    if (foot) h += '<div class="card-foot">' + foot + '</div>';
    if (it.appUrl) h += '<a class="btn card-cta" href="' + esc(it.appUrl) + '" target="_blank" rel="noopener noreferrer">' + icon('play') + '<span>' + esc(t('openApp')) + '</span>' + icon('ext') + '</a>';
    return h + '</div></article>';
  }

  /* ---------- masonry board ---------- */
  var GAP = 16, MIN_COL = 236, boardsRO = null, dirtyBoxes = [], layoutRaf = 0, firstMount = true;
  function tr(x, y) { return 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)'; }
  function allCards(box) { return Array.prototype.filter.call(box.children, function (el) { return el.classList.contains('mcard'); }); }
  function cardList(box) { return allCards(box).filter(function (el) { return !el.classList.contains('is-add'); }); }
  function groupIds(box) { return cardList(box).map(function (c) { return c.getAttribute('data-id'); }); }
  function boxes() { return Array.prototype.slice.call(D.querySelectorAll('#grid .masonry')); }
  function layoutBox(box) {
    var cards = allCards(box), W = box.clientWidth;
    if (!W || !cards.length) { box.style.height = cards.length ? box.style.height : '0px'; return; }
    var list = view === 'list';
    var n = list ? 1 : Math.max(1, Math.floor((W + GAP) / (MIN_COL + GAP)));
    var colW = list ? Math.min(W, 720) : (W - GAP * (n - 1)) / n, x0 = list ? (W - colW) / 2 : 0;
    var cols = [], k;
    for (k = 0; k < n; k++) cols.push(0);
    cards.forEach(function (c) { c.style.width = colW + 'px'; });
    var hs = cards.map(function (c) { return c.offsetHeight; });
    cards.forEach(function (c, i) {
      var col = 0;
      for (k = 1; k < n; k++) if (cols[k] < cols[col] - 1) col = k;
      c._x = x0 + col * (colW + GAP); c._y = cols[col]; c._w = colW; c._h = hs[i];
      if (!c.classList.contains('dragging')) c.style.transform = tr(c._x, c._y);
      cols[col] += hs[i] + GAP;
    });
    box.style.height = Math.max(0, Math.max.apply(null, cols) - GAP) + 'px';
  }
  function relayoutAll() { boxes().forEach(layoutBox); }
  function scheduleLayout(box) {
    if (!box || !box.classList || !box.classList.contains('masonry')) return;
    if (dirtyBoxes.indexOf(box) < 0) dirtyBoxes.push(box);
    if (layoutRaf) return;
    layoutRaf = requestAnimationFrame(function () {
      layoutRaf = 0;
      var list = dirtyBoxes; dirtyBoxes = [];
      list.forEach(function (b) { if (b.isConnected) layoutBox(b); });
    });
  }
  function observeBoxes(bs) {
    if (!('ResizeObserver' in window)) return;
    if (!boardsRO) boardsRO = new ResizeObserver(function (entries) {
      entries.forEach(function (en) { var el = en.target; scheduleLayout(el.classList.contains('masonry') ? el : el.parentNode); });
    });
    boardsRO.disconnect();
    bs.forEach(function (b) { boardsRO.observe(b); allCards(b).forEach(function (c) { boardsRO.observe(c); }); });
  }
  window.addEventListener('resize', function () { boxes().forEach(scheduleLayout); });
  function snapRects() {
    var m = {};
    Array.prototype.forEach.call(D.querySelectorAll('#grid .mcard[data-id]'), function (c) { m[c.getAttribute('data-id')] = c.getBoundingClientRect(); });
    return m;
  }
  function mountBoards(old) {
    var bs = boxes();
    bs.forEach(function (b) {
      b.classList.add('instant');
      layoutBox(b);
      Array.prototype.forEach.call(b.querySelectorAll('img'), function (im) { if (!im.complete) im.addEventListener('load', function () { scheduleLayout(b); }); });
    });
    observeBoxes(bs);
    if (old) {
      bs.forEach(function (b) {
        var br = b.getBoundingClientRect();
        allCards(b).forEach(function (c) {
          var o = old[c.getAttribute('data-id')];
          if (o) c.style.transform = tr(o.left - br.left, o.top - br.top);
          else { c.style.opacity = '0'; c.style.transform = tr(c._x, c._y + 14) + ' scale(.97)'; }
        });
      });
      void D.body.offsetHeight;
      requestAnimationFrame(function () {
        bs.forEach(function (b) {
          b.classList.remove('instant');
          allCards(b).forEach(function (c) { c.style.opacity = ''; if (!c.classList.contains('dragging')) c.style.transform = tr(c._x, c._y); });
        });
      });
    } else {
      var first = firstMount; firstMount = false;
      setTimeout(function () { bs.forEach(function (b) { b.classList.remove('instant'); }); }, first ? 700 : 40);
      if (first && !reduced()) {
        var n = 0;
        bs.forEach(function (b) {
          allCards(b).forEach(function (c) {
            if (typeof c.animate !== 'function') return;
            c.animate([{ transform: tr(c._x, c._y + 28) + ' scale(.97)', opacity: 0.35 }, { transform: tr(c._x, c._y), opacity: 1 }], { duration: 560, delay: Math.min(n++, 14) * 55, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
          });
        });
      }
    }
  }

  /* ---------- quick card actions ---------- */
  function swatchesHTML(cur) {
    return '<div class="swatches" role="group" aria-label="' + esc(t('color')) + '">' + [''].concat(TINTS).map(function (k) {
      return '<button type="button" class="sw tint-' + (k || 'none') + '" data-act="tint" data-tint="' + k + '" aria-pressed="' + ((cur || '') === k) + '" aria-label="' + esc(tintName(k)) + '" title="' + esc(tintName(k)) + '"></button>';
    }).join('') + '</div>';
  }
  function closeSwatches() {
    Array.prototype.forEach.call(D.querySelectorAll('.mcard .swatches'), function (s) {
      var c = s.closest('.mcard');
      if (c) { c.classList.remove('menu-open'); var b = c.querySelector('[data-act="palette"]'); if (b) b.setAttribute('aria-expanded', 'false'); }
      s.remove();
    });
  }
  function toggleSwatches(card, btn) {
    var wasOpen = !!card.querySelector('.swatches');
    closeSwatches();
    if (wasOpen) return;
    var it = findItem(card.getAttribute('data-id')); if (!it) return;
    card.insertAdjacentHTML('beforeend', swatchesHTML(it.color));
    card.classList.add('menu-open');
    btn.setAttribute('aria-expanded', 'true');
    var first = card.querySelector('.swatches .sw[aria-pressed="true"]') || card.querySelector('.swatches .sw');
    if (first) first.focus();
  }
  function applyTint(card, k) {
    TINTS.forEach(function (x) { card.classList.remove('tint-' + x); });
    if (k) card.classList.add('tint-' + k);
  }
  function applyGroupOrder(ids) {
    var set = {}, byId = {}, slots = [];
    ids.forEach(function (id) { set[id] = 1; });
    state.items.forEach(function (it, i) { byId[it.id] = it; if (set[it.id]) slots.push(i); });
    if (slots.length !== ids.length) return;
    var items = state.items.slice();
    slots.forEach(function (slot, k) { items[slot] = byId[ids[k]]; });
    state.items = items;
  }
  function queueSave() {
    if (fileMode) { dirty = true; setSaveState('file'); return; }
    setSaveState('pending');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 1600);
  }
  function flushSave() {
    saveTimer = null;
    if (drag || (dlg && dlg.open)) { saveTimer = setTimeout(flushSave, 900); return; }
    setSaveState('saving');
    save(state, 'orderSaved').then(function (ok) { setSaveState(ok ? '' : 'error'); });
  }
  function setSaveState(s) {
    saveState = s || '';
    var el = D.getElementById('save-state'); if (!el) return;
    el.textContent = saveState === 'pending' ? t('savePending') : saveState === 'saving' ? t('saveSaving') : saveState === 'error' ? t('saveError') : saveState === 'file' ? t('fileDirty') : '';
    el.className = 'save-state' + (saveState ? ' is-' + saveState : '');
  }
  function downloadFile() {
    try {
      var out = Object.assign({}, state, { updatedAt: todayISO() });
      var blob = INLINE ? new Blob([buildDoc(out)], { type: 'text/html' }) : new Blob(['window.PORTFOLIO_DATA = ' + JSON.stringify(out, null, 1) + ';\n'], { type: 'text/javascript' });
      var a = D.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = INLINE ? 'portfolio.html' : 'portfolio.js';
      D.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      dirty = false; setSaveState(''); toast(t('downloaded'));
    } catch (e) { toast(t('saveFailed')); }
  }

  function renderEditBar() {
    var bytes = INLINE ? byteLen(buildDoc(state)) : 0, pct = Math.min(100, bytes / LIMIT * 100);
    var meter = !INLINE ? '' : '<span class="meter' + (pct > 80 ? ' warn' : '') + '" title="' + esc(t('storage')) + '"><span class="meter-bar"><i style="width:' + pct.toFixed(1) + '%"></i></span>' + (bytes / 1048576).toFixed(1) + ' / 16 MB</span>';
    return '<div class="editbar" role="region" aria-label="' + esc(t('editMode')) + '"><div class="editbar-in">' +
      '<div class="eb-info"><span class="eb-dot" aria-hidden="true"></span><span class="eb-note">' + esc(fileMode ? t(INLINE ? 'fileNote' : 'fileNoteProj') : t('editNote')) + '</span>' + meter +
      '<span class="save-state" id="save-state" role="status" aria-live="polite"></span></div>' +
      '<div class="eb-acts"><button type="button" class="btn btn-ghost" data-act="toggle-edit">' + esc(t('doneEdit')) + '</button>' +
      '<button type="button" class="btn" data-act="profile">' + icon('user') + '<span class="hide-sm">' + esc(t('editProfile')) + '</span></button>' +
      '<button type="button" class="btn' + (fileMode ? '' : ' btn-primary') + '" data-act="add" data-cat="' + (filter === 'all' ? '' : filter) + '">' + icon('plus') + '<span>' + esc(t('addWork')) + '</span></button>' +
      (fileMode ? '<button type="button" class="btn btn-primary" data-act="download">' + icon('download') + '<span>' + esc(t(INLINE ? 'download' : 'downloadData')) + '</span></button>' : '') +
      '</div></div></div>';
  }

  /* ---------- toast & copy ---------- */
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }
  function selectEl(el) { try { var r = D.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) { } }
  function copyFrom(id) {
    var el = D.getElementById(id); if (!el) return;
    var text = el.textContent;
    var fail = function () { selectEl(el); toast(t('copyFail')); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast(t('copied')); }, fail);
      else fail();
    } catch (e) { fail(); }
  }

  /* ---------- dialog ---------- */
  var dlgMode = '', closing = false, detailId = null, detailImgs = [], detailImg = 0;
  function motionOK() { return !reduced() && typeof dlg.animate === 'function'; }
  function morphT(a, b) {
    return 'translate(' + (b.left - a.left).toFixed(1) + 'px,' + (b.top - a.top).toFixed(1) + 'px) scale(' + (b.width / a.width).toFixed(4) + ',' + (b.height / a.height).toFixed(4) + ')';
  }
  function fadeBackdrop(show, ms) {
    try { dlg.animate(show ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], { duration: ms, pseudoElement: '::backdrop', fill: show ? 'none' : 'forwards' }); } catch (e) { }
  }
  function cardEl(id) {
    var all = D.querySelectorAll('#grid .mcard[data-id]');
    for (var i = 0; i < all.length; i++) if (all[i].getAttribute('data-id') === id) return all[i];
    return null;
  }
  function openDlg(html, onClick, mode) {
    dlgMode = mode || 'form';
    if (closing) { closing = false; stopDlgAnims(); }
    dlg.innerHTML = html;
    dlgClick = onClick;
    if (!dlg.open) {
      lastFocus = D.activeElement;
      try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); }
    }
    dlg.scrollTop = 0;
    D.documentElement.classList.add('dlg-open');
  }
  function stopDlgAnims() {
    try { (dlg.getAnimations ? dlg.getAnimations({ subtree: true }) : []).forEach(function (a) { a.cancel(); }); } catch (e) { }
  }
  function closeDlg(now) {
    activeForm = null;
    if (!dlg.open || closing) return;
    var card = !now && dlgMode === 'detail' && detailId ? cardEl(detailId) : null;
    if (card && motionOK()) {
      var to = card.getBoundingClientRect(), from = dlg.getBoundingClientRect();
      if (to.width && from.width && to.bottom > 0 && to.top < window.innerHeight) {
        closing = true;
        var anim = dlg.animate([{ transform: 'none', opacity: 1 }, { transform: morphT(from, to), opacity: 0.2 }], { duration: 280, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
        fadeBackdrop(false, 280);
        anim.onfinish = function () { if (closing) { closing = false; hardClose(); } };
        return;
      }
    }
    hardClose();
  }
  function hardClose() {
    if (!dlg.open) return;
    try { dlg.close(); } catch (e) { dlg.removeAttribute('open'); onDlgClose(); }
  }
  function onDlgClose() {
    stopDlgAnims();
    D.documentElement.classList.remove('dlg-open');
    var wasDetail = dlgMode === 'detail' ? detailId : null;
    dlgClick = null; activeForm = null; dlg.innerHTML = ''; dlgMode = ''; detailId = null; closing = false;
    var target = wasDetail && cardEl(wasDetail) ? cardEl(wasDetail).querySelector('.card-link') : lastFocus;
    if (target && target.isConnected) { try { target.focus({ preventScroll: true }); } catch (e) { } }
  }

  /* ---------- detail view ---------- */
  function renderProse(text) {
    var lines = str(text).split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    var out = '', inList = false;
    lines.forEach(function (l) {
      var m = /^[•\-*·–]\s*(.+)$/.exec(l);
      if (m) { if (!inList) { out += '<ul>'; inList = true; } out += '<li>' + esc(m[1]) + '</li>'; }
      else { if (inList) { out += '</ul>'; inList = false; } out += '<p>' + esc(l) + '</p>'; }
    });
    if (inList) out += '</ul>';
    return out;
  }
  function plainBullets(text) {
    return str(text).split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean).map(function (l) { var m = /^[•\-*·–]\s*(.+)$/.exec(l); return m ? '• ' + m[1] : l; }).join('\n');
  }
  function hashtag(s) { return str(s).replace(/[^\p{L}\p{M}\p{N}_]+/gu, ''); }
  function kolPost(it) {
    var en = lang === 'en', lines = [pick(it.title)];
    if (it.people && it.org) lines.push(en ? 'Worked with ' + it.people + ' for ' + it.org : 'ร่วมงานกับ ' + it.people + ' ให้แบรนด์ ' + it.org);
    else if (it.org) lines.push((en ? 'Campaign for ' : 'แคมเปญให้แบรนด์ ') + it.org);
    else if (it.people) lines.push((en ? 'Worked with ' : 'ร่วมงานกับ ') + it.people);
    if (pick(it.role)) lines.push((en ? 'My role: ' : 'บทบาทของเรา: ') + pick(it.role));
    if (pick(it.summary)) lines.push('', pick(it.summary));
    if (it.metrics.length) { lines.push('', en ? 'Results' : 'ผลลัพธ์'); it.metrics.forEach(function (m) { lines.push('• ' + [m.k, m.v].filter(Boolean).join(': ')); }); }
    var tags = ['KOLMarketing', 'InfluencerMarketing'].concat(it.tags.map(hashtag)).filter(function (x, i, a) { return x && a.indexOf(x) === i; }).slice(0, 6);
    lines.push('', tags.map(function (x) { return '#' + x; }).join(' '));
    return lines.join('\n');
  }
  function linkedinHTML(it) {
    var title = pick(it.title), link = it.appUrl || (it.links[0] ? it.links[0].url : '');
    var h = '<section class="li" aria-labelledby="li-t"><div class="li-head" id="li-t">' + icon('case') + '<span>' + esc(t('liTitle')) + '</span><small>' + esc(t('liOnly')) + '</small></div>';
    if (it.cat === 'kol') {
      h += '<div class="li-row"><span class="li-k">' + esc(t('directLink')) + '</span><div class="li-v" id="li-link">#' + esc(it.id) + '</div><button type="button" class="icon-btn" data-act="copy" data-target="li-link" aria-label="' + esc(t('copy') + ' ' + t('directLink')) + '">' + icon('copy') + '</button></div><p class="hint">' + esc(t('directHint')) + '</p>';
      h += '<p class="hint">' + esc(t('liKolHint')) + '</p><pre class="li-post" id="li-post">' + esc(kolPost(it)) + '</pre><div><button type="button" class="btn btn-sm" data-act="copy" data-target="li-post">' + icon('copy') + esc(t('copyPost')) + '</button></div>';
    } else {
      var desc = [pick(it.summary), plainBullets(pick(it.details))].filter(Boolean).join('\n\n');
      var rows = it.cat === 'cert'
        ? [['Name', title], ['Issuing organization', it.org], ['Issue date', fmtDate(it.date, 'en')], ['Credential ID', it.credId], ['Credential URL', link]]
        : [['Project name', title], ['Description', desc], ['Skills', it.tags.join(', ')], ['Project URL', link], ['Start date', fmtDate(it.date, 'en')]];
      h += '<div class="li-row"><span class="li-k">' + esc(t('directLink')) + '</span><div class="li-v" id="li-link">#' + esc(it.id) + '</div><button type="button" class="icon-btn" data-act="copy" data-target="li-link" aria-label="' + esc(t('copy') + ' ' + t('directLink')) + '">' + icon('copy') + '</button></div><p class="hint">' + esc(t('directHint')) + '</p>';
      h += '<p class="hint">' + esc(it.cat === 'cert' ? t('liCertHint') : t('liProjHint')) + '</p>';
      rows.forEach(function (r, i) {
        if (!r[1]) return;
        h += '<div class="li-row"><span class="li-k">' + esc(r[0]) + '</span><div class="li-v" id="li-' + i + '">' + esc(r[1]) + '</div><button type="button" class="icon-btn" data-act="copy" data-target="li-' + i + '" aria-label="' + esc(t('copy') + ' ' + r[0]) + '">' + icon('copy') + '</button></div>';
      });
    }
    return h + '</section>';
  }

  function navOrder() {
    var l = visibleItems(), inList = l.some(function (x) { return x.id === detailId; });
    if (!inList) l = state.items.slice();
    return l.filter(function (x) { return x.featured; }).concat(l.filter(function (x) { return !x.featured; }));
  }
  function navDetail(dir) {
    var o = navOrder(); if (o.length < 2) return;
    var i = -1; o.forEach(function (x, k) { if (x.id === detailId) i = k; });
    var j = ((i < 0 ? 0 : i) + dir + o.length) % o.length;
    openDetail(o[j].id, { dir: dir });
  }
  function setImg(i) {
    if (!detailImgs.length) return;
    detailImg = (i + detailImgs.length) % detailImgs.length;
    var m = D.getElementById('g-main');
    if (m) {
      m.src = detailImgs[detailImg];
      if (motionOK()) m.animate([{ opacity: 0.25, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
    }
    Array.prototype.forEach.call(dlg.querySelectorAll('.g-thumbs button'), function (x, k) { x.setAttribute('aria-pressed', String(k === detailImg)); });
    var cnt = D.getElementById('g-count'); if (cnt) cnt.textContent = (detailImg + 1) + ' / ' + detailImgs.length;
  }
  function morphIn(from) {
    var to = dlg.getBoundingClientRect(); if (!to.width || !from || !from.width) return;
    dlg.animate([{ transform: morphT(to, from), opacity: 0.35 }, { transform: 'none', opacity: 1 }], { duration: 430, easing: 'cubic-bezier(.2,.85,.25,1)' });
    var inner = dlg.firstElementChild;
    if (inner) inner.animate([{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }], { duration: 430, easing: 'ease-out' });
    fadeBackdrop(true, 430);
  }

  function openDetail(id, opts) {
    opts = opts || {};
    var it = findItem(id); if (!it) return;
    detailId = id;
    var c = it.cat, imgs = it.images.slice(), title = pick(it.title) || t('untitled');
    var order = navOrder(), pos = 0;
    order.forEach(function (x, k) { if (x.id === id) pos = k; });
    var h = '<div class="dlg-in" data-cat="' + c + '">';
    h += '<div class="dlg-bar"><span class="chip">' + icon(c) + esc(catName(c)) + '</span>' + (it.featured ? '<span class="feat-badge">' + icon('pushpin') + esc(t('featured')) + '</span>' : '') + '<span class="grow"></span>';
    if (order.length > 1) h += '<span class="d-nav"><span class="nav-pos" aria-live="polite">' + (pos + 1) + ' / ' + order.length + '</span><button type="button" class="icon-btn" data-act="prev" aria-label="' + esc(t('prevWork')) + '" title="' + esc(t('prevWork')) + '">' + icon('chevL') + '</button><button type="button" class="icon-btn" data-act="next" aria-label="' + esc(t('nextWork')) + '" title="' + esc(t('nextWork')) + '">' + icon('chevR') + '</button></span>';
    h += '<button type="button" class="icon-btn" data-act="close" aria-label="' + esc(t('close')) + '">' + icon('x') + '</button></div>';
    if (imgs.length) {
      h += '<div class="gallery"><div class="g-main"><img id="g-main" src="' + imgs[0] + '" alt="' + esc(title) + '">';
      if (imgs.length > 1) h += '<button type="button" class="g-nav prev" data-act="gprev" aria-label="' + esc(t('prevImg')) + '">' + icon('chevL') + '</button><button type="button" class="g-nav next" data-act="gnext" aria-label="' + esc(t('nextImg')) + '">' + icon('chevR') + '</button><span class="g-count" id="g-count">1 / ' + imgs.length + '</span>';
      h += '</div>';
      if (imgs.length > 1) h += '<div class="g-thumbs">' + imgs.map(function (s, i) { return '<button type="button" data-act="thumb" data-i="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="' + esc(t('imageN') + ' ' + (i + 1)) + '"><img src="' + s + '" alt=""></button>'; }).join('') + '</div>';
      h += '</div>';
    }
    if (!imgs.length) h += '<div class="gallery gen-head">' + genCover(it, 760, 180) + '</div>';
    h += '<div class="d-body"><h2 class="d-title">' + esc(title) + '</h2>';
    if (it.appUrl) h += '<div class="d-cta"><a class="btn btn-app" href="' + esc(it.appUrl) + '" target="_blank" rel="noopener noreferrer">' + icon('play') + '<span>' + esc(t('openApp')) + '</span>' + icon('ext') + '</a><span class="hint">' + esc(hostOf(it.appUrl)) + ' · ' + esc(t('newTab')) + '</span></div>';
    // The app only loads into the phone frame once the visitor taps, so opening the dialog stays light.
    if (it.embed) h += '<section class="d-try"><div class="phone"><div class="phone-screen" id="phone-screen">' + (imgs[0] ? '<img class="phone-poster" src="' + imgs[0] + '" alt="">' : '') + '<button type="button" class="phone-start" data-act="try">' + icon('play') + '<b>' + esc(t('tryStart')) + '</b><span>' + esc(hostOf(it.appUrl)) + '</span></button></div></div><div class="try-side"><h3>' + esc(t('tryHere')) + '</h3><p class="hint">' + esc(t('tryHereSub')) + '</p></div></section>';
    if (it.video) h += '<div class="d-video"><video src="' + it.video + '"' + (imgs[0] ? ' poster="' + imgs[0] + '"' : '') + ' controls playsinline muted preload="metadata" aria-label="' + esc(t('demoVideo') + ': ' + title) + '"></video></div>';
    var facts = [];
    if (c === 'kol' && it.people) facts.push([t('fPeople'), esc(it.people)]);
    if (it.org) facts.push([L(CAT[c].org), esc(it.org)]);
    if (pick(it.role)) facts.push([t('fRole'), esc(pick(it.role))]);
    if (it.date) facts.push([c === 'cert' ? t('issued') : t('when'), esc(fmtDate(it.date))]);
    if (c === 'app' && it.status) facts.push([t('fStatus'), statusHTML(it.status)]);
    if (c === 'cert' && it.credId) facts.push(['Credential ID', esc(it.credId)]);
    if (facts.length) h += '<dl class="facts">' + facts.map(function (f) { return '<div class="fact"><dt>' + esc(f[0]) + '</dt><dd>' + f[1] + '</dd></div>'; }).join('') + '</dl>';
    if (pick(it.summary)) h += '<p class="lead">' + esc(pick(it.summary)) + '</p>';
    if (pick(it.details)) h += '<div class="d-sec"><h3>' + esc(t('fDetails')) + '</h3><div class="prose">' + renderProse(pick(it.details)) + '</div></div>';
    if (it.metrics.length) h += '<div class="d-sec"><h3>' + esc(t('results')) + '</h3><div class="kpis lg">' + it.metrics.map(kpiHTML).join('') + '</div></div>';
    if (it.posts.length) h += postsHTML(it.posts);
    if (it.tags.length) h += '<div class="d-sec"><h3>' + esc(t('skills')) + '</h3><div class="tags">' + it.tags.map(function (g) { return '<button type="button" class="tag tag-btn" data-act="dtag" data-tag="' + esc(g) + '" title="' + esc(t('showSkill')) + '">' + esc(g) + '</button>'; }).join('') + '</div></div>';
    if (it.links.length) h += '<div class="d-sec"><h3>' + esc(t('links')) + '</h3><div class="links">' + it.links.map(function (l) { return '<a class="btn" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' + icon('link') + '<span>' + esc(l.label || hostOf(l.url)) + '</span>' + icon('ext') + '</a>'; }).join('') + '</div></div>';
    if (canWrite) {
      h += linkedinHTML(it);
      h += '<div class="d-actions"><button type="button" class="btn" data-act="edit">' + icon('pencil') + '<span>' + esc(t('edit')) + '</span></button><button type="button" class="btn btn-danger" data-act="del">' + icon('trash') + '<span>' + esc(t('del')) + '</span></button></div>';
    }
    if (order.length > 1) h += '<p class="nav-hint"><span class="hint-keys"><kbd class="kbd">←</kbd><kbd class="kbd">→</kbd> ' + esc(t('navKeys')) + '</span><span class="hint-swipe">' + esc(t('navSwipe')) + '</span></p>';
    h += '</div></div>';
    openDlg(h, function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var a = b.getAttribute('data-act');
      if (a === 'close') closeDlg();
      else if (a === 'prev') navDetail(-1);
      else if (a === 'next') navDetail(1);
      else if (a === 'gprev') setImg(detailImg - 1);
      else if (a === 'gnext') setImg(detailImg + 1);
      else if (a === 'thumb') setImg(+b.getAttribute('data-i'));
      else if (a === 'try') { var scr = D.getElementById('phone-screen'); if (scr) scr.classList.add('live'), scr.innerHTML = '<iframe src="' + esc(it.appUrl) + '" title="' + esc(title) + '" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" allow="clipboard-write" referrerpolicy="no-referrer"></iframe>'; }
      else if (a === 'dtag') { tagFilter = b.getAttribute('data-tag'); filter = 'all'; query = ''; var qi = D.getElementById('q'); if (qi) qi.value = ''; closeDlg(true); renderSheet(true); var wk = D.getElementById('work'); if (wk) wk.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); }
      else if (a === 'copy') copyFrom(b.getAttribute('data-target'));
      else if (a === 'edit') openEditor(it);
      else if (a === 'del') {
        var lbl = b.lastChild;
        if (b.classList.contains('armed')) {
          b.disabled = true;
          save(Object.assign({}, state, { items: state.items.filter(function (x) { return x.id !== it.id; }) }), 'deleted').then(function (ok) { if (!ok && b.isConnected) b.disabled = false; });
        } else {
          b.classList.add('armed'); lbl.textContent = t('confirmDelete');
          setTimeout(function () { if (b.isConnected && !b.disabled) { b.classList.remove('armed'); lbl.textContent = t('del'); } }, 4000);
        }
      }
    }, 'detail');
    detailImgs = imgs; detailImg = 0;
    countUp(dlg);
    if (opts.from && motionOK()) morphIn(opts.from);
    if (opts.dir) { var keep = dlg.querySelector('[data-act="' + (opts.dir > 0 ? 'next' : 'prev') + '"]'); if (keep) { try { keep.focus({ preventScroll: true }); } catch (e) { } } }
    if (opts.dir && motionOK() && dlg.firstElementChild) dlg.firstElementChild.animate([{ transform: 'translateX(' + (opts.dir * 42) + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }

  /* ---------- files ---------- */
  function fileToImg(f) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () { URL.revokeObjectURL(u); res(im); };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('decode')); };
      im.src = u;
    });
  }
  function shrink(src, w, h, max, q) {
    q = q || 0.82;
    var s = Math.min(1, max / Math.max(w, h)), cw = Math.max(1, Math.round(w * s)), ch = Math.max(1, Math.round(h * s));
    var cv = D.createElement('canvas'); cv.width = cw; cv.height = ch;
    var x = cv.getContext('2d'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, cw, ch);
    x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, cw, ch);
    var out = cv.toDataURL('image/jpeg', q);
    if (out.length > 1150000 && max > 900) return shrink(src, w, h, Math.round(max * 0.75), 0.74);
    return out;
  }
  function squareCrop(img, size) {
    var w = img.naturalWidth, h = img.naturalHeight, s = Math.min(w, h);
    var cv = D.createElement('canvas'); cv.width = size; cv.height = size;
    var x = cv.getContext('2d'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, size, size);
    x.imageSmoothingQuality = 'high'; x.drawImage(img, (w - s) / 2, (h - s) / 2, s, s, 0, 0, size, size);
    return cv.toDataURL('image/jpeg', 0.86);
  }
  var pdfReady = null;
  function loadScript(src) {
    return new Promise(function (res, rej) { var s = D.createElement('script'); s.src = src; s.async = true; s.onload = function () { res(); }; s.onerror = function () { rej(new Error('load')); }; D.head.appendChild(s); });
  }
  function ensurePdf() {
    if (!pdfReady) {
      pdfReady = loadScript(PDFJS + 'pdf.min.js').then(function () { return loadScript(PDFJS + 'pdf.worker.min.js'); }).then(function () {
        var lib = window.pdfjsLib; if (!lib) throw new Error('nolib');
        try { lib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; } catch (e) { }
        return lib;
      });
      pdfReady.catch(function () { pdfReady = null; });
    }
    return pdfReady;
  }
  function pdfToJpeg(f) {
    return ensurePdf().then(function (lib) {
      return f.arrayBuffer().then(function (buf) { return lib.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise; });
    }).then(function (pdf) { return pdf.getPage(1); }).then(function (page) {
      var v1 = page.getViewport({ scale: 1 }), sc = Math.min(3, 1800 / Math.max(v1.width, v1.height)), vp = page.getViewport({ scale: sc });
      var cv = D.createElement('canvas'); cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
      var ctx = cv.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cv.width, cv.height);
      return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () { return shrink(cv, cv.width, cv.height, 1600, 0.85); });
    });
  }
  function isPdf(f) { return f.type === 'application/pdf' || /\.pdf$/i.test(f.name || ''); }
  function isImage(f) { return /^image\//.test(f.type || '') || /\.(png|jpe?g|webp|gif|bmp|heic|heif|avif)$/i.test(f.name || ''); }
  function processFile(f) {
    if (isPdf(f)) return pdfToJpeg(f).catch(function () { throw new Error('pdf'); });
    if (!isImage(f)) return Promise.reject(new Error('type'));
    return fileToImg(f).then(function (im) { return shrink(im, im.naturalWidth, im.naturalHeight, 1600); }, function () { throw new Error('img'); });
  }
  function fileError(err) { var m = err && err.message; toast(m === 'type' ? t('fileType') : m === 'pdf' ? t('pdfFail') : t('imgFail')); }

  /* ---------- form helpers ---------- */
  function fg(label, inner, hint) { return '<div class="fgroup"><div class="flabel">' + esc(label) + '</div>' + inner + (hint ? '<p class="hint">' + esc(hint) + '</p>' : '') + '</div>'; }
  function inp(id, value, label, ph, extra) { return '<label class="field"><span>' + esc(label) + '</span><input class="inp" id="' + id + '" value="' + esc(value) + '" placeholder="' + esc(ph || '') + '"' + (extra || '') + '></label>'; }
  function area(id, value, label, ph, rows, extra) { return '<label class="field"><span>' + esc(label) + '</span><textarea class="inp" id="' + id + '" rows="' + (rows || 3) + '" placeholder="' + esc(ph || '') + '"' + (extra || '') + '>' + esc(value) + '</textarea></label>'; }
  function pair(a, b) { return '<div class="pair">' + a + b + '</div>'; }
  function val(id) { var el = D.getElementById(id); return el ? el.value : null; }
  function rowsOf(sel, a, b) { return Array.prototype.map.call(dlg.querySelectorAll(sel), function (r) { return [r.querySelector(a).value, r.querySelector(b).value]; }); }
  function formFoot(label) {
    return '<div class="form-foot"><span class="form-err" id="form-err" role="alert"></span><button type="button" class="btn" data-act="close">' + esc(t('cancel')) + '</button><button type="submit" class="btn btn-primary" id="f-save">' + esc(label) + '</button></div>';
  }
  function blockEnter(form) {
    form.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') e.preventDefault(); });
  }
  function bindDrop(zone, onFiles) {
    if (!zone) return;
    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', function () { zone.classList.remove('over'); });
    zone.addEventListener('drop', function (e) { e.preventDefault(); zone.classList.remove('over'); if (e.dataTransfer && e.dataTransfer.files) onFiles(e.dataTransfer.files); });
  }

  /* ---------- item editor ---------- */
  function blankItem(cat) {
    return { id: newId(), cat: CATS.indexOf(cat) >= 0 ? cat : 'app', featured: false, title: { th: '', en: '' }, role: { th: '', en: '' }, summary: { th: '', en: '' }, details: { th: '', en: '' }, org: '', people: '', credId: '', appUrl: '', color: '', date: '', status: '', metrics: [], tags: [], links: [], images: [] };
  }
  function itemFormHTML(d, isNew) {
    var c = d.cat, C = CAT[c];
    var ym = splitDate(d.date), yv = d._y != null ? d._y : ym.y, mv = d._m != null ? d._m : ym.m;
    var h = '<div class="dlg-in" data-cat="' + c + '"><div class="dlg-bar"><strong class="dlg-title">' + esc(isNew ? t('formNew') : t('formEdit')) + '</strong><span class="grow"></span><button type="button" class="icon-btn" data-act="close" aria-label="' + esc(t('close')) + '">' + icon('x') + '</button></div>';
    h += '<form id="item-form" novalidate><div class="form">';
    h += fg(t('fCat'), '<div class="seg" role="group" aria-label="' + esc(t('fCat')) + '">' + CATS.map(function (k) { return '<button type="button" data-act="cat" data-cat="' + k + '" aria-pressed="' + (k === c) + '">' + icon(k) + '<span>' + esc(catName(k)) + '</span></button>'; }).join('') + '</div>');
    h += fg(t('fTitle'), pair(inp('f-title-th', d.title.th, t('thai'), C.titlePh.th), inp('f-title-en', d.title.en, t('english'), C.titlePh.en)));
    if (c === 'app') h += fg(t('fAppUrl'), inp('f-appurl', d.appUrl || '', 'URL', 'https://claude.ai/artifact/…', ' type="url" inputmode="url"'), t('appUrlHint'));
    var org = inp('f-org', d.org, L(C.org), L(C.orgPh));
    if (c === 'kol') h += '<div class="fgroup">' + pair(inp('f-people', d.people, t('fPeople'), t('fPeoplePh')), org) + '</div>';
    else if (c === 'cert') h += '<div class="fgroup">' + pair(org, inp('f-cred', d.credId, 'Credential ID', t('fCredPh'))) + '</div>';
    else h += '<div class="fgroup">' + org + '</div>';
    h += fg(t('fRole'), pair(inp('f-role-th', d.role.th, t('thai'), C.rolePh.th), inp('f-role-en', d.role.en, t('english'), C.rolePh.en)));
    var dateHtml = '<div class="pair"><label class="field"><span>' + esc(t('month')) + '</span><select class="inp" id="f-month"><option value="">—</option>' +
      MONTHS[lang].map(function (m, i) { var v = pad2(i + 1); return '<option value="' + v + '"' + (mv === v ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') +
      '</select></label>' + inp('f-year', yv, t('year'), t('yearPh'), ' inputmode="numeric" maxlength="4"') + '</div>';
    if (c === 'app') dateHtml += '<label class="field"><span>' + esc(t('fStatus')) + '</span><select class="inp" id="f-status"><option value="">—</option>' + Object.keys(STATUS).map(function (k) { return '<option value="' + k + '"' + (d.status === k ? ' selected' : '') + '>' + esc(L(STATUS[k])) + '</option>'; }).join('') + '</select></label>';
    h += fg(t('fDate'), dateHtml);
    h += fg(t('fSummary'), pair(area('f-sum-th', d.summary.th, t('thai'), '', 3, ' maxlength="280"'), area('f-sum-en', d.summary.en, t('english'), '', 3, ' maxlength="280"')), t('sumHint'));
    h += fg(t('fDetails'), pair(area('f-det-th', d.details.th, t('thai'), '• ', 6), area('f-det-en', d.details.en, t('english'), '• ', 6)), t('detHint'));
    var ms = d.metrics.length ? d.metrics : [{ k: '', v: '' }];
    h += fg(t('fMetrics'), '<div class="rows" id="m-rows">' + ms.map(function (m, i) {
      return '<div class="row2"><input class="inp m-k" id="m-k-' + i + '" aria-label="' + esc(t('metricLabel')) + '" placeholder="' + esc(t('metricLabel')) + '" value="' + esc(m.k) + '"><input class="inp m-v" id="m-v-' + i + '" aria-label="' + esc(t('metricValue')) + '" placeholder="' + esc(t('metricValue')) + '" value="' + esc(m.v) + '"><button type="button" class="icon-btn" data-act="m-del" data-i="' + i + '" aria-label="' + esc(t('removeRow')) + '">' + icon('x') + '</button></div>';
    }).join('') + '</div><button type="button" class="btn-text" data-act="m-add">+ ' + esc(t('addRow')) + '</button>', L(C.metricHint));
    h += fg(t('fTags'), '<input class="inp" id="f-tags" aria-label="' + esc(t('fTags')) + '" value="' + esc(d._tags != null ? d._tags : d.tags.join(', ')) + '">', t('tagsHint'));
    var ls = d.links.length ? d.links : [{ label: '', url: '' }];
    h += fg(t('fLinks'), '<div class="rows" id="l-rows">' + ls.map(function (l, i) {
      return '<div class="row2 wide"><input class="inp l-k" id="l-k-' + i + '" aria-label="' + esc(t('linkLabel')) + '" placeholder="' + esc(t('linkLabel')) + '" value="' + esc(l.label) + '"><input class="inp l-u" id="l-u-' + i + '" type="url" inputmode="url" aria-label="URL" placeholder="https://" value="' + esc(l.url) + '"><button type="button" class="icon-btn" data-act="l-del" data-i="' + i + '" aria-label="' + esc(t('removeRow')) + '">' + icon('x') + '</button></div>';
    }).join('') + '</div><button type="button" class="btn-text" data-act="l-add">+ ' + esc(t('addRow')) + '</button>', L(C.linkHint));
    var im = '<div class="drop" id="drop"><input type="file" id="f-files" class="sr" accept="image/*,application/pdf" multiple><label for="f-files" class="drop-label">' + icon('upload') + '<span><b>' + esc(t('chooseFiles')) + '</b> ' + esc(t('orDrop')) + '</span></label><p class="hint">' + esc(t('imgHint')) + '</p><p class="busy" id="img-busy"' + (d._busy ? '' : ' hidden') + '>' + esc(t('processing')) + '</p></div>';
    if (d.images.length) im += '<div class="thumbs-edit">' + d.images.map(function (s, i) {
      return '<figure><img src="' + s + '" alt=""><button type="button" class="icon-btn rm" data-act="img-del" data-i="' + i + '" aria-label="' + esc(t('removeImg')) + '">' + icon('x') + '</button><figcaption>' + (i === 0 ? '<span class="cover-tag">' + esc(t('coverTag')) + '</span>' : '<button type="button" class="btn-text" data-act="img-cover" data-i="' + i + '">' + esc(t('makeCover')) + '</button>') + '</figcaption></figure>';
    }).join('') + '</div>';
    h += fg(t('fImages'), im);
    h += fg(t('color'), '<div class="swatch-row" role="group" aria-label="' + esc(t('color')) + '">' + [''].concat(TINTS).map(function (k) { return '<button type="button" class="sw tint-' + (k || 'none') + '" data-act="f-tint" data-tint="' + k + '" aria-pressed="' + ((d.color || '') === k) + '" aria-label="' + esc(tintName(k)) + '" title="' + esc(tintName(k)) + '"></button>'; }).join('') + '</div>');
    h += '<label class="check"><input type="checkbox" id="f-featured"' + (d.featured ? ' checked' : '') + '><span>' + esc(t('fFeatured')) + '</span></label>';
    h += '<p class="nudge">' + esc(t('enNudge')) + '</p>';
    h += '</div>' + formFoot(t('save')) + '</form></div>';
    return h;
  }

  function openEditor(item, presetCat) {
    var isNew = !item;
    var d = item ? JSON.parse(JSON.stringify(item)) : blankItem(presetCat);
    d._busy = 0;
    var token = {};
    function draw(keep) {
      var st = dlg.scrollTop;
      openDlg(itemFormHTML(d, isNew), onClick);
      activeForm = token;
      if (keep) dlg.scrollTop = st;
      var form = D.getElementById('item-form');
      blockEnter(form);
      form.addEventListener('submit', onSubmit);
      var fi = D.getElementById('f-files');
      fi.addEventListener('change', function () { addFiles(fi.files); fi.value = ''; });
      bindDrop(D.getElementById('drop'), addFiles);
    }
    function collect() {
      if (activeForm !== token) return;
      d.title = { th: val('f-title-th'), en: val('f-title-en') };
      d.role = { th: val('f-role-th'), en: val('f-role-en') };
      d.summary = { th: val('f-sum-th'), en: val('f-sum-en') };
      d.details = { th: val('f-det-th'), en: val('f-det-en') };
      d.org = val('f-org');
      if (val('f-people') != null) d.people = val('f-people');
      if (val('f-cred') != null) d.credId = val('f-cred');
      if (val('f-status') != null) d.status = val('f-status');
      if (val('f-appurl') != null) d.appUrl = val('f-appurl');
      d._y = val('f-year'); d._m = val('f-month');
      d._tags = val('f-tags');
      d.metrics = rowsOf('#m-rows .row2', '.m-k', '.m-v').map(function (r) { return { k: r[0], v: r[1] }; });
      d.links = rowsOf('#l-rows .row2', '.l-k', '.l-u').map(function (r) { return { label: r[0], url: r[1] }; });
      var f = D.getElementById('f-featured'); d.featured = !!(f && f.checked);
    }
    function addFiles(list) {
      var files = Array.prototype.slice.call(list || []);
      if (!files.length) return;
      d._busy++;
      var busyEl = D.getElementById('img-busy'); if (busyEl) busyEl.hidden = false;
      var out = [], seq = Promise.resolve();
      files.forEach(function (f) { seq = seq.then(function () { return processFile(f).then(function (src) { if (safeImg(src)) out.push(src); }, fileError); }); });
      seq.then(function () {
        d._busy--;
        if (activeForm !== token) return;
        collect();
        d.images = d.images.concat(out);
        draw(true);
      });
    }
    function onClick(e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var a = b.getAttribute('data-act'), i = +b.getAttribute('data-i');
      if (a === 'close') { closeDlg(); return; }
      if (['cat', 'm-add', 'm-del', 'l-add', 'l-del', 'img-del', 'img-cover', 'f-tint'].indexOf(a) < 0) return;
      collect();
      if (a === 'cat') d.cat = b.getAttribute('data-cat');
      else if (a === 'f-tint') d.color = b.getAttribute('data-tint');
      else if (a === 'm-add') d.metrics.push({ k: '', v: '' });
      else if (a === 'm-del') d.metrics.splice(i, 1);
      else if (a === 'l-add') d.links.push({ label: '', url: '' });
      else if (a === 'l-del') d.links.splice(i, 1);
      else if (a === 'img-del') d.images.splice(i, 1);
      else if (a === 'img-cover') d.images.unshift(d.images.splice(i, 1)[0]);
      draw(true);
      if (a === 'm-add') focusLast('#m-rows .m-k');
      if (a === 'l-add') focusLast('#l-rows .l-k');
    }
    function focusLast(sel) { var all = dlg.querySelectorAll(sel); if (all.length) all[all.length - 1].focus(); }
    function onSubmit(e) {
      e.preventDefault();
      var err = D.getElementById('form-err'), btn = D.getElementById('f-save');
      collect();
      if (d._busy > 0) { err.textContent = t('errBusy'); return; }
      var y = str(d._y).trim(), year = y ? normYear(y) : '';
      var badLink = d.links.some(function (l) { return str(l.url).trim() && !safeUrl(l.url); }) || (d.cat === 'app' && str(d.appUrl).trim() && !safeUrl(d.appUrl));
      if (!str(d.title.th).trim() && !str(d.title.en).trim()) { err.textContent = t('errTitle'); D.getElementById('f-title-th').focus(); return; }
      if (year === null) { err.textContent = t('errYear'); D.getElementById('f-year').focus(); return; }
      if (badLink) { err.textContent = t('errLink'); return; }
      err.textContent = '';
      var clean = normItem({
        id: d.id, cat: d.cat, featured: d.featured,
        title: trimBi(d.title), role: trimBi(d.role), summary: trimBi(d.summary), details: trimBi(d.details),
        org: str(d.org).trim(), people: d.cat === 'kol' ? str(d.people).trim() : '', credId: d.cat === 'cert' ? str(d.credId).trim() : '',
        appUrl: d.cat === 'app' ? safeUrl(d.appUrl) : '',
        color: d.color || '',
        date: year ? (d._m ? year + '-' + d._m : year) : '', status: d.cat === 'app' ? d.status : '',
        metrics: d.metrics.map(function (m) { return { k: str(m.k).trim(), v: str(m.v).trim() }; }),
        tags: str(d._tags).split(/[,，、\n]/).map(function (s) { return s.trim(); }).filter(Boolean).filter(function (x, i, a) { return a.indexOf(x) === i; }),
        links: d.links.map(function (l) { return { label: str(l.label).trim(), url: safeUrl(l.url) }; }),
        images: d.images.slice(),
        video: d.video,
        clip: d.clip,
        posts: d.posts,
        embed: d.embed
      });
      var exists = !!findItem(clean.id);
      var items = exists ? state.items.map(function (x) { return x.id === clean.id ? clean : x; }) : state.items.concat([clean]);
      btn.disabled = true; btn.textContent = t('saving');
      save(Object.assign({}, state, { items: items }), exists ? 'saved' : 'added').then(function (ok) {
        if (!ok && btn.isConnected) { btn.disabled = false; btn.textContent = t('save'); }
      });
    }
    draw(false);
  }
  function trimBi(o) { return { th: str(o && o.th).trim(), en: str(o && o.en).trim() }; }

  /* ---------- profile editor ---------- */
  function openProfile() {
    var p = JSON.parse(JSON.stringify(state.profile)), token = {}, busy = 0;
    function html() {
      var h = '<div class="dlg-in"><div class="dlg-bar"><strong class="dlg-title">' + esc(t('pTitle')) + '</strong><span class="grow"></span><button type="button" class="icon-btn" data-act="close" aria-label="' + esc(t('close')) + '">' + icon('x') + '</button></div>';
      h += '<form id="profile-form" novalidate><div class="form">';
      h += fg(t('pPhoto'), '<div class="photo-edit">' + avatarHTML(p) + '<input type="file" id="p-photo" class="sr" accept="image/*"><label for="p-photo" class="btn btn-sm">' + icon('upload') + esc(t('pChoose')) + '</label>' + (p.photo ? '<button type="button" class="btn btn-sm btn-ghost" data-act="photo-del">' + esc(t('pRemove')) + '</button>' : '') + '</div>');
      h += fg(t('pName'), inp('p-name', p.name, t('pName'), ''));
      h += fg(t('pHeadline'), pair(inp('p-hl-th', p.headline.th, t('thai'), ''), inp('p-hl-en', p.headline.en, t('english'), '')));
      h += fg(t('pBio'), pair(area('p-bio-th', p.bio.th, t('thai'), '', 5), area('p-bio-en', p.bio.en, t('english'), '', 5)));
      h += fg(t('pLocation'), pair(inp('p-loc-th', p.location.th, t('thai'), ''), inp('p-loc-en', p.location.en, t('english'), '')));
      h += fg(t('pContact'), '<div class="rows">' + inp('p-li', p.linkedin, t('pLinkedin'), 'https://www.linkedin.com/in/…', ' type="url" inputmode="url"') + inp('p-email', p.email, t('pEmail'), 'name@example.com', ' type="email" inputmode="email"') + inp('p-web', p.website, t('pWebsite'), 'https://', ' type="url" inputmode="url"') + '</div>', t('pContactHint'));
      h += '</div>' + formFoot(t('save')) + '</form></div>';
      return h;
    }
    function collect() {
      if (activeForm !== token) return;
      p.name = val('p-name'); p.headline = { th: val('p-hl-th'), en: val('p-hl-en') }; p.bio = { th: val('p-bio-th'), en: val('p-bio-en') };
      p.location = { th: val('p-loc-th'), en: val('p-loc-en') }; p.linkedin = val('p-li'); p.email = val('p-email'); p.website = val('p-web');
    }
    function draw(keep) {
      var st = dlg.scrollTop;
      openDlg(html(), onClick);
      activeForm = token;
      if (keep) dlg.scrollTop = st;
      var form = D.getElementById('profile-form');
      blockEnter(form);
      form.addEventListener('submit', onSubmit);
      var fi = D.getElementById('p-photo');
      fi.addEventListener('change', function () {
        var f = fi.files && fi.files[0]; fi.value = '';
        if (!f) return;
        if (!isImage(f)) { toast(t('fileType')); return; }
        busy++;
        fileToImg(f).then(function (im) { return squareCrop(im, 480); }).then(function (src) {
          busy--; if (activeForm !== token) return; collect(); p.photo = src; draw(true);
        }, function () { busy--; toast(t('imgFail')); });
      });
    }
    function onClick(e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var a = b.getAttribute('data-act');
      if (a === 'close') closeDlg();
      else if (a === 'photo-del') { collect(); p.photo = ''; draw(true); }
    }
    function onSubmit(e) {
      e.preventDefault();
      var err = D.getElementById('form-err'), btn = D.getElementById('f-save');
      collect();
      if (busy > 0) { err.textContent = t('errBusy'); return; }
      var li = str(p.linkedin).trim(), web = str(p.website).trim(), em = str(p.email).trim();
      if ((li && !safeUrl(li)) || (web && !safeUrl(web))) { err.textContent = t('errLink'); return; }
      if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { err.textContent = t('errEmail'); D.getElementById('p-email').focus(); return; }
      err.textContent = '';
      var clean = { name: str(p.name).trim(), headline: trimBi(p.headline), bio: trimBi(p.bio), location: trimBi(p.location), photo: safeImg(p.photo), linkedin: safeUrl(li), email: em, website: safeUrl(web) };
      btn.disabled = true; btn.textContent = t('saving');
      save(Object.assign({}, state, { profile: clean }), 'saved').then(function (ok) { if (!ok && btn.isConnected) { btn.disabled = false; btn.textContent = t('save'); } });
    }
    draw(false);
  }

  /* ---------- saving (the page republishes itself) ---------- */
  var READ_ONLY = ['not_writer', 'not_granted', 'not_declared', 'capability_disabled', 'capability_removed', 'consent_required'];
  function save(next, okKey) {
    clearTimeout(saveTimer); saveTimer = null;
    if (fileMode) {
      state = Object.assign({}, next, { updatedAt: todayISO(), v: 1 }); dirty = true; saveState = 'file';
      closeDlg(true); render(); toast(t(okKey === 'orderSaved' ? 'fileDirty' : (INLINE ? 'fileSaved' : 'fileSavedProj')));
      return Promise.resolve(true);
    }
    if (!artifactNS || !canWrite) { toast(t('readOnly')); return Promise.resolve(false); }
    next = Object.assign({}, next, { updatedAt: todayISO(), v: 1 });
    var html = buildDoc(next);
    if (byteLen(html) > MAX_BYTES) { toast(t('tooLarge')); return Promise.resolve(false); }
    ssSet('pf-edit', editing ? '1' : '');
    ssSet('pf-toast', okKey);
    publishing = true;
    function attempt(n) {
      return Promise.resolve().then(function () { return artifactNS.publish(html); }).then(function () {
        publishing = false;
        state = next; closeDlg(true); render(); toast(t(okKey));
        return true;
      }, function (err) {
        var code = err && err.code;
        if ((code === 'upstream_error' || !code) && n === 0) return wait(600 + Math.random() * 900).then(function () { return attempt(1); });
        publishing = false;
        ssDel('pf-toast');
        if (code === 'conflict') toast(t('conflict'));
        else if (READ_ONLY.indexOf(code) >= 0) { canWrite = false; editing = false; ssDel('pf-edit'); closeDlg(true); render(); toast(t('readOnly')); }
        else if (code === 'too_large') toast(t('tooLarge'));
        else if (code === 'rate_limited') toast(t('rateLimited'));
        else toast(t('saveFailed'));
        return false;
      });
    }
    return attempt(0);
  }

  /* ---------- events ---------- */
  app.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b || !app.contains(b)) return;
    var a = b.getAttribute('data-act'), id = b.getAttribute('data-id'), c = b.getAttribute('data-cat');
    if (a === 'lang') { lang = lang === 'th' ? 'en' : 'th'; lsSet('pf-lang', lang); render(); }
    else if (a === 'toggle-edit') { editing = !editing; if (editing) ssSet('pf-edit', '1'); else ssDel('pf-edit'); render(); }
    else if (a === 'filter') { filter = c; tagFilter = ''; renderSheet(true); }
    else if (a === 'skill') { var tg = b.getAttribute('data-tag'); tagFilter = tagFilter === tg ? '' : tg; renderSheet(true); }
    else if (a === 'clear-filters') { query = ''; tagFilter = ''; var qq = D.getElementById('q'); if (qq) qq.value = ''; renderSheet(true); }
    else if (a === 'jump') { filter = c; tagFilter = ''; renderSheet(true); var w = D.getElementById('work'); if (w) w.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); }
    else if (a === 'open') { var oc = b.closest('.mcard'); openDetail(id, { from: oc ? oc.getBoundingClientRect() : null }); }
    else if (a === 'edit') { var it = findItem(id); if (it) openEditor(it); }
    else if (a === 'add') openEditor(null, c || (filter !== 'all' ? filter : 'app'));
    else if (a === 'profile') openProfile();
    else if (a === 'copy') copyFrom(b.getAttribute('data-target'));
    else if (a === 'ob-hide') { lsSet('pf-ob-hide', '1'); render(); }
    else if ((a === 'pin' || a === 'palette' || a === 'tint') && publishing) toast(t('saveWait'));
    else if (a === 'pin') { var pi = findItem(id); if (pi) { pi.featured = !pi.featured; renderSheet(true); queueSave(); } }
    else if (a === 'palette') { var pc = b.closest('.mcard'); if (pc) toggleSwatches(pc, b); }
    else if (a === 'tint') { var tc = b.closest('.mcard'), ti = tc && findItem(tc.getAttribute('data-id')); if (ti) { ti.color = b.getAttribute('data-tint'); applyTint(tc, ti.color); closeSwatches(); queueSave(); } }
    else if (a === 'view') { view = b.getAttribute('data-view') === 'list' ? 'list' : 'grid'; lsSet('pf-view', view); renderSheet(true); }
    else if (a === 'download') downloadFile();
  });
  app.addEventListener('input', function (e) { if (e.target && e.target.id === 'q') { query = e.target.value; renderSheet(true); } });

  /* ---------- drag to reorder (Keep-style) ---------- */
  var drag = null, suppressClick = false;
  app.addEventListener('pointerdown', function (e) {
    if (!editing || drag || publishing) return;
    var card = e.target.closest('.mcard[data-id]');
    if (!card || !app.contains(card)) return;
    var grip = e.target.closest('.grip');
    if (!grip) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      if (e.target.closest('a, input, textarea, select, .mtools button, .swatches')) return;
    }
    drag = { card: card, box: card.parentNode, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, pid: e.pointerId, on: false, last: null, raf: 0 };
    if (grip) { e.preventDefault(); beginDrag(); }
  });
  D.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.pid) return;
    drag.x = e.clientX; drag.y = e.clientY;
    if (!drag.on) {
      if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 7) return;
      beginDrag();
    }
    e.preventDefault();
    moveDrag();
  }, { passive: false });
  window.addEventListener('scroll', function () { if (drag && drag.on) moveDrag(); }, { passive: true });
  D.addEventListener('pointerup', endDrag);
  D.addEventListener('pointercancel', endDrag);
  app.addEventListener('click', function (e) { if (suppressClick) { e.stopPropagation(); e.preventDefault(); suppressClick = false; } }, true);

  function beginDrag() {
    var d = drag, br = d.box.getBoundingClientRect();
    d.on = true;
    d.ox = d.sx - (br.left + d.card._x); d.oy = d.sy - (br.top + d.card._y);
    d.start = groupIds(d.box).join('|');
    try { (d.card.getAnimations ? d.card.getAnimations() : []).forEach(function (an) { an.cancel(); }); } catch (err) { }
    clearHover();
    closeSwatches();
    d.card.classList.add('dragging'); d.box.classList.add('sorting'); D.body.classList.add('is-dragging');
    try { d.card.setPointerCapture(d.pid); } catch (err) { }
    moveDrag();
    d.raf = requestAnimationFrame(autoScroll);
  }
  function moveDrag() {
    var d = drag; if (!d || !d.on) return;
    var br = d.box.getBoundingClientRect();
    d.card.style.transform = tr(d.x - br.left - d.ox, d.y - br.top - d.oy) + ' rotate(1.2deg) scale(1.03)';
    var px = d.x - br.left, py = d.y - br.top, target = null;
    cardList(d.box).forEach(function (c) {
      if (c === d.card) return;
      if (px >= c._x && px <= c._x + c._w && py >= c._y && py <= c._y + c._h) target = c;
    });
    if (d.last && target !== d.last) d.last = null;
    if (!target || target === d.last) return;
    var cards = cardList(d.box), from = cards.indexOf(d.card), to = cards.indexOf(target);
    d.box.insertBefore(d.card, from < to ? target.nextSibling : target);
    try { d.card.setPointerCapture(d.pid); } catch (err) { }
    d.last = target;
    layoutBox(d.box);
  }
  function autoScroll() {
    var d = drag; if (!d || !d.on) return;
    var edge = 72, v = 0, H = window.innerHeight;
    if (d.y < edge) v = -Math.ceil((edge - d.y) / 5);
    else if (d.y > H - edge) v = Math.ceil((d.y - (H - edge)) / 5);
    if (v) { window.scrollBy(0, v); moveDrag(); }
    d.raf = requestAnimationFrame(autoScroll);
  }
  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.pid)) return;
    var d = drag; drag = null;
    cancelAnimationFrame(d.raf);
    if (!d.on) return;
    try { d.card.releasePointerCapture(d.pid); } catch (err) { }
    d.card.classList.remove('dragging'); d.box.classList.remove('sorting'); D.body.classList.remove('is-dragging');
    suppressClick = true; setTimeout(function () { suppressClick = false; }, 0);
    layoutBox(d.box);
    var ids = groupIds(d.box);
    if (ids.join('|') !== d.start) { applyGroupOrder(ids); queueSave(); }
  }
  app.addEventListener('keydown', function (e) {
    var g = e.target.closest && e.target.closest('.grip');
    if (!g || !editing || publishing) return;
    var k = e.key, dir = (k === 'ArrowLeft' || k === 'ArrowUp') ? -1 : (k === 'ArrowRight' || k === 'ArrowDown') ? 1 : 0;
    if (!dir) return;
    e.preventDefault();
    var card = g.closest('.mcard'), box = card.parentNode, cards = cardList(box), i = cards.indexOf(card), j = i + dir;
    if (j < 0 || j >= cards.length) return;
    box.insertBefore(card, dir < 0 ? cards[j] : cards[j].nextSibling);
    layoutBox(box);
    g.focus();
    applyGroupOrder(groupIds(box));
    queueSave();
  });
  D.addEventListener('pointerdown', function (e) { if (!e.target.closest('.swatches, [data-act="palette"]')) closeSwatches(); }, true);
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && D.querySelector('.mcard .swatches')) { closeSwatches(); } });


  dlg = D.createElement('dialog');
  dlg.className = 'dlg';
  D.body.appendChild(dlg);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) { closeDlg(); return; } if (dlgClick) dlgClick(e); });
  dlg.addEventListener('close', onDlgClose);
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); closeDlg(); });
  D.addEventListener('keydown', function (e) {
    if (!dlg.open || closing || dlgMode !== 'detail' || e.altKey || e.ctrlKey || e.metaKey || (e.target.closest && e.target.closest('input, textarea, select'))) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); navDetail(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); navDetail(-1); }
  });
  var swipe = null;
  dlg.addEventListener('pointerdown', function (e) { if (dlgMode !== 'detail' || e.pointerType === 'mouse') return; swipe = { x: e.clientX, y: e.clientY, t: Date.now(), g: !!e.target.closest('.g-main'), id: e.pointerId }; });
  dlg.addEventListener('pointerup', function (e) {
    if (!swipe || e.pointerId !== swipe.id) return;
    var s0 = swipe, dx = e.clientX - s0.x, dy = e.clientY - s0.y; swipe = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.4 || Date.now() - s0.t > 800) return;
    if (s0.g && detailImgs.length > 1) setImg(detailImg + (dx < 0 ? 1 : -1)); else navDetail(dx < 0 ? 1 : -1);
  });
  dlg.addEventListener('pointercancel', function () { swipe = null; });

  /* ---------- hover spotlight + cover parallax (mouse only) ---------- */
  function clearHover() { if (!hoverCard) return; var im = hoverCard.querySelector('.mcover img'); if (im) im.style.transform = ''; hoverCard = null; }
  app.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || editing || drag || reduced()) { clearHover(); return; }
    var c = e.target.closest ? e.target.closest('.mcard[data-id]') : null;
    if (c !== hoverCard) clearHover();
    if (!c) return;
    hoverCard = c;
    var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); c.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    var im = c.querySelector('.mcover img'); if (im) im.style.transform = 'scale(1.05) translate(' + ((0.5 - x) * 10).toFixed(1) + 'px,' + ((0.5 - y) * 10).toFixed(1) + 'px)';
  });
  app.addEventListener('pointerleave', clearHover);

  /* ---------- keyboard: / to search, Esc to clear ---------- */
  D.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || dlg.open) return;
    if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    var q = D.getElementById('q'); if (q) { e.preventDefault(); q.focus(); q.select(); }
  });
  app.addEventListener('keydown', function (e) { if (e.key === 'Escape' && e.target && e.target.id === 'q' && e.target.value) { e.preventDefault(); e.target.value = ''; query = ''; renderSheet(true); } });


  toastEl = D.createElement('div');
  toastEl.className = 'toast';
  toastEl.setAttribute('role', 'status');
  toastEl.setAttribute('aria-live', 'polite');
  D.body.appendChild(toastEl);

  render();
  (function countUp() {
    if (reduced()) return;
    var els = Array.prototype.slice.call(D.querySelectorAll('.index-row .num')), targets = els.map(function (el) { return +el.textContent || 0; }), t0 = 0;
    function step(now) { if (!t0) t0 = now; var pr = Math.min(1, (now - t0) / 750), ez = 1 - Math.pow(1 - pr, 3);
      els.forEach(function (el, i) { if (el.isConnected) el.textContent = pad2(Math.round(targets[i] * ez)); });
      if (pr < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  })();

  /* ---------- owner detection ---------- */
  function safeUse(name) { try { return Promise.resolve(window.claude.use(name)).catch(function () { return null; }); } catch (e) { return Promise.resolve(null); } }
  function initCaps() {
    if (capsStarted || !(window.claude && typeof window.claude.use === 'function')) return;
    capsStarted = true;
    Promise.all([safeUse('artifact'), safeUse('user')]).then(function (r) {
      artifactNS = r[0]; userNS = r[1];
      if (!artifactNS || !userNS) return false;
      return Promise.resolve().then(function () { return userNS.canEdit(); }).catch(function () { return false; });
    }).then(function (ok) {
      if (!ok) return;
      canWrite = true;
      if (ssGet('pf-edit') === '1') editing = true;
      render();
      var k = ssGet('pf-toast');
      if (k) { ssDel('pf-toast'); toast(t(k)); }
    });
  }
  function maybeFileMode() { if (capsStarted || fileMode || (window.claude && window.claude.use)) return; if (/^#edit$/i.test(location.hash || '')) enableFileMode(); }
  function enableFileMode() {
    fileMode = true; canWrite = true; editing = true; render(); toast(t('fileModeOn'));
    window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  }
  function openFromHash() {
    var h = ''; try { h = decodeURIComponent((location.hash || '').replace(/^#/, '')); } catch (e) { return; }
    if (!h || !findItem(h) || (dlg.open && detailId === h)) return;
    if (filter !== 'all' || tagFilter || query) { filter = 'all'; tagFilter = ''; query = ''; var qx = D.getElementById('q'); if (qx) qx.value = ''; renderSheet(false); }
    var card = cardEl(h);
    if (card) card.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
    setTimeout(function () { var c2 = cardEl(h); openDetail(h, { from: c2 ? c2.getBoundingClientRect() : null }); }, card ? 450 : 0);
  }
  setTimeout(openFromHash, 900);
  window.addEventListener('hashchange', openFromHash);
  setTimeout(maybeFileMode, INLINE ? 4500 : 200);
  window.addEventListener('hashchange', maybeFileMode);
  if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { relayoutAll(); });
  initCaps();
  if (!capsStarted) {
    D.addEventListener('DOMContentLoaded', initCaps);
    window.addEventListener('load', initCaps);
    setTimeout(initCaps, 1200);
    setTimeout(initCaps, 4000);
  }
})();

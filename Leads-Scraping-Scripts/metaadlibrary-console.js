(async () => {
  /****************************************
   * 🟦 FACEBOOK LINK SCRAPER
   ****************************************/
  const fbAnchors = document.querySelectorAll('a');
  const fbLinks = [];

  fbAnchors.forEach(a => {
    let realURL = '';
    const lynx = a.getAttribute('data-lynx-uri');

    // Prefer data-lynx-uri if present
    if (lynx) {
      try {
        const url = new URL(lynx);
        const encoded = url.searchParams.get('u');
        if (encoded) realURL = decodeURIComponent(encoded);
      } catch (e) {}
    }

    // Fallback to href
    if (!realURL && a.href.includes('facebook.com')) {
      realURL = a.href;
    }

    if (realURL) fbLinks.push(realURL);
  });

  // Filter valid profile/page/post URLs
  const realFBLinks = fbLinks.filter(link => {
    let finalLink = link;
    if (finalLink.includes('l.facebook.com/l.php?u=')) {
      try {
        const url = new URL(finalLink);
        const encoded = url.searchParams.get('u');
        if (encoded) finalLink = decodeURIComponent(encoded);
      } catch (e) {}
    }

    const isFB = finalLink.includes('facebook.com/');
    const isProfileOrPost =
      /^https:\/\/(www\.)?facebook\.com\/[^\/?#]+\/?$/.test(finalLink) ||
      /^https:\/\/(www\.)?facebook\.com\/[^\/?#]+\/posts\//.test(finalLink) ||
      /^https:\/\/(www\.)?facebook\.com\/[0-9]{5,}/.test(finalLink);

    const isBad =
      finalLink.includes('/ads/') ||
      finalLink.includes('/privacy') ||
      finalLink.includes('/policies');

    return isFB && isProfileOrPost && !isBad;
  });

  const uniqueFBLinks = [...new Set(realFBLinks)];


  /****************************************
   * 🟪 INSTAGRAM LINK SCRAPER
   ****************************************/
  const instaAnchors = document.querySelectorAll('a.x1hl2dhg');
  const instaLinks = [];

  instaAnchors.forEach(a => {
    const href = a.href;

    if (href.includes('instagram.com')) {
      if (href.includes('l.facebook.com')) {
        try {
          const url = new URL(href);
          const original = url.searchParams.get('u');
          if (original && original.includes('instagram.com')) {
            instaLinks.push(decodeURIComponent(original));
          }
        } catch (e) {
          console.log('URL parse error:', e);
        }
      } else {
        instaLinks.push(href);
      }
    }
  });

  const uniqueInstaLinks = [...new Set(instaLinks)];

  // Clean usernames
  const cleanProfiles = uniqueInstaLinks.map(link => {
    try {
      const url = new URL(link);
      let pathname = url.pathname;

      if (pathname.startsWith('/_u/')) pathname = pathname.replace('/_u/', '/');

      let username = pathname.replace(/\//g, '');
      username = username.replace(/\/$/, '');

      return username ? `https://instagram.com/${username}` : null;
    } catch {
      return null;
    }
  }).filter(Boolean);

  const finalInstaLinks = [...new Set(cleanProfiles)];


  /****************************************
   * 🟩 COMBINE BOTH INTO ONE CSV
   ****************************************/
  const headerFB = 'Facebook Links';
  const headerInsta = 'Instagram Links';

  const csvContent = 
    'data:text/csv;charset=utf-8,' +
    `"${headerFB}"\n` +
    uniqueFBLinks.map(link => `"${link}"`).join('\n') +
    `\n\n"${headerInsta}"\n` +
    finalInstaLinks.map(link => `"${link}"`).join('\n');

  // Download CSV
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'social_links.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log(`✅ Done! ${uniqueFBLinks.length} Facebook + ${finalInstaLinks.length} Instagram links saved as CSV.`);
})();

(async () => {
  // 1️⃣ Select all cards
  const cards = document.querySelectorAll('.srp-listing');

  const data = [];

  cards.forEach(card => {
    // 🏢 Business Name
    const nameElem = card.querySelector('.business-name span');
    const businessName = nameElem?.innerText.trim() || '';

    // 🧾 Description / Categories
    const descElem = card.querySelector('.categories');
    const description = descElem
      ? Array.from(descElem.querySelectorAll('a'))
          .map(a => a.innerText.trim())
          .join(', ')
      : '';

    // 📞 Phone Number
    const phoneElem = card.querySelector('.phones.phone.primary');
    const phone = phoneElem?.innerText.trim() || '';

    // 📍 Address
    const street = card.querySelector('.adr .street-address')?.innerText.trim() || '';
    const locality = card.querySelector('.adr .locality')?.innerText.trim() || '';
    const address = [street, locality].filter(Boolean).join(', ');

    // 📅 Years in Business (optional extra info)
    const years = card.querySelector('.years-in-business strong')?.innerText.trim() || '';

    // 🧠 Push to array
    data.push({
      businessName,
      description,
      phone,
      address,
      yearsInBusiness: years
    });
  });

  // 2️⃣ Convert to CSV
  function convertToCSV(arr) {
    if (arr.length === 0) return '';
    const headers = Object.keys(arr[0]);
    const rows = arr.map(obj =>
      headers.map(h => `"${String(obj[h] || '').replace(/"/g, '""')}"`).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  // 3️⃣ Download CSV
  function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // 4️⃣ Run export
  if (data.length > 0) {
    const csv = convertToCSV(data);
    downloadCSV(csv, 'yellowpages_leads.csv');
    console.log(`✅ Done! ${data.length} leads extracted and downloaded as yellowpages_leads.csv`);
  } else {
    console.log('⚠️ No leads found on this page.');
  }
})();
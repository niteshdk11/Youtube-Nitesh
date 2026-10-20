(async () => {

    // ----------------------------
    // Find the scrollable results panel
    // ----------------------------
    const panel =
        document.querySelector('div[role="feed"]') ||
        [...document.querySelectorAll("div")]
            .find(d => d.scrollHeight > d.clientHeight && d.querySelector('div[role="article"]'));

    if (!panel) {
        alert("Couldn't find Google Maps results panel.");
        return;
    }

    console.log("📜 Scrolling to load all companies...");

    // ----------------------------
    // Auto Scroll
    // ----------------------------
    let lastHeight = 0;
    let sameCount = 0;

    while (sameCount < 8) {

        panel.scrollTo(0, panel.scrollHeight);

        await new Promise(r => setTimeout(r, 2000));

        if (panel.scrollHeight === lastHeight) {
            sameCount++;
        } else {
            sameCount = 0;
            lastHeight = panel.scrollHeight;
        }

        console.log("Loaded:", document.querySelectorAll('div[role="article"]').length);

    }

    console.log("✅ Finished Scrolling");

    // ----------------------------
    // Extract Data
    // ----------------------------

    const unique = new Map();

    document.querySelectorAll('div[role="article"]').forEach(card => {

        const name =
            card.querySelector(".qBF1Pd")?.innerText.trim() ||
            card.querySelector("a.hfpxzc")?.getAttribute("aria-label")?.replace(" · Visited link","") ||
            "";

        if (!name) return;

        // Duplicate Removal
        if (unique.has(name.toLowerCase()))
            return;

        // Google Maps
        const googleMaps =
            card.querySelector("a.hfpxzc")?.href || "";

        // Website
        const website =
            card.querySelector('a[data-value="Website"]')?.href || "";

        // Phone
        const phone =
            card.querySelector(".UsdlK")?.innerText.trim() || "";

        // Rating
        const rating =
            card.querySelector(".MW4etd")?.innerText.trim() || "";

        // Rating Count
        const ratingCount =
            card.querySelector(".UY7F9")?.innerText.replace(/[()]/g, "") || "";

        let category = "";
        let address = "";
        let status = "";

        [...card.querySelectorAll(".W4Efsd")].forEach(row => {

            const txt = row.innerText.replace(/\n/g," ").trim();

            // Category + Address
            if (txt.includes("·") && !category) {

                const p = txt.split("·").map(x=>x.trim());

                if(p.length>=2){

                    category = p[0];
                    address = p[1];

                }
            }

            // Status

            if (/Open|Closed|Temporarily closed|Permanently closed/i.test(txt)){

                status = txt.split("·")[0].trim();

            }

        });

        unique.set(name.toLowerCase(),{
            Name:name,
            Category:category,
            Phone:phone,
            Website:website,
            Address:address,
            GoogleMaps:googleMaps,
            Directions:googleMaps,
            Status:status,
            Rating:rating,
            RatingCount:ratingCount
        });

    });

    const results=[...unique.values()];

    console.table(results);

    // ----------------------------
    // CSV
    // ----------------------------

    const headers=[
        "Name",
        "Category",
        "Phone",
        "Website",
        "Address",
        "GoogleMaps",
        "Directions",
        "Status",
        "Rating",
        "RatingCount"
    ];

    const csv=[
        headers.join(","),
        ...results.map(r=>
            headers.map(h=>
                `"${String(r[h]||"").replace(/"/g,'""')}"`
            ).join(",")
        )
    ].join("\n");

    const blob=new Blob([csv],{type:"text/csv"});

    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="Google_Maps_Companies.csv";
    a.click();

    console.log(`✅ Exported ${results.length} unique companies.`);

})();

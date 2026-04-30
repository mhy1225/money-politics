document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landing-page');
    const resultsPage = document.getElementById('results-page');
    const searchBtn = document.getElementById('search-btn');
    const backBtn = document.getElementById('back-btn');
    const searchInput = document.getElementById('main-search');
    const searchTermDisplay = document.getElementById('search-term-display');
    const exampleBtns = document.querySelectorAll('.example-btn');

    const resultsContainer = document.getElementById('results-container');
    const totalAmountDisplay = document.getElementById('total-amount');
    const totalCountDisplay = document.getElementById('total-count');

    let rawData = []; 

    // 💰 1. 讀取並解析 CSV 檔案
    async function loadCampaignFinanceData() {
        try {
            console.log('準備打開金庫大門... 讀取 A05_basic_all.csv');
            const response = await fetch('A05_basic_all.csv');
            
            if (!response.ok) throw new Error('檔案讀取失敗');
            
            const text = await response.text();
            rawData = parseCSV(text);
            console.log(`成功載入 ${rawData.length} 筆黃金紀錄！`);
        } catch (error) {
            console.error('讀取 CSV 失敗:', error);
            alert('⚠️ 讀取 A05_basic_all.csv 失敗！請確認檔案有一起上傳到 GitHub！');
        }
    }

    // 簡易的 CSV 解析器
    function parseCSV(text) {
        const lines = text.split(/\r?\n/);
        if (lines.length === 0) return [];
        
        // 抓取第一行作為欄位名稱
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            // 處理 CSV 格式（忽略引號內的逗號以防止欄位錯亂）
            const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
            let rowObj = {};
            headers.forEach((header, index) => {
                rowObj[header] = values[index] ? values[index].trim().replace(/"/g, '') : '';
            });
            data.push(rowObj);
        }
        return data;
    }

    // 💰 2. 執行搜尋並印出結果
    function executeSearch(term) {
        if (!term.trim()) {
            alert('請先輸入你要查的對象！金庫大門不會為空手而來的人打開！');
            return;
        }

        const results = rawData.filter(row => {
            return Object.values(row).some(value => value.includes(term));
        });

        renderResults(term, results);

        landingPage.classList.remove('active');
        resultsPage.classList.add('active');
    }

    // 💰 3. 將資料渲染到網頁上 (🔥 針對 A05_basic_all.csv 的真實欄位修改)
    function renderResults(term, results) {
        searchTermDisplay.textContent = term;
        resultsContainer.innerHTML = ''; 

        if (results.length === 0) {
            resultsContainer.innerHTML = '<h3 style="text-align:center; color:white; padding: 20px;">💸 這裡沒有他的黃金紀錄，他是個窮光蛋（或藏得很好）💸</h3>';
            totalAmountDisplay.textContent = 'NT$ 0';
            totalCountDisplay.textContent = '0';
            return;
        }

        let totalAmount = 0;

        results.forEach(row => {
            // ⚠️ 針對你的 CSV 真實欄位名稱進行抓取！
            const amountStr = String(row['總收入'] || '0');
            const candidate = row['姓名'] || '未知政客';
            const party = row['推薦政黨'] || '無黨籍';
            const corpDonation = String(row['營利事業捐贈收入'] || '0');
            const personalDonation = String(row['個人捐贈收入'] || '0');

            // 去除逗號，轉成純數字以便計算和格式化
            const amount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;
            const corpAmount = parseInt(corpDonation.replace(/\D/g, ''), 10) || 0;
            const personalAmount = parseInt(personalDonation.replace(/\D/g, ''), 10) || 0;

            totalAmount += amount;

            // 產生專屬的俗氣卡片 (符合候選人總表的概念)
            const itemDiv = document.createElement('div');
            itemDiv.className = 'result-item';
            itemDiv.innerHTML = `
                <div class="result-amount">NT$ ${amount.toLocaleString()}</div>
                <div class="result-details">
                    <strong>吸金政客：</strong> ${candidate} (${party}) <br>
                    <strong>企業財團進貢：</strong> NT$ ${corpAmount.toLocaleString()} <br>
                    <strong>一般選民(個人)捐贈：</strong> NT$ ${personalAmount.toLocaleString()}
                </div>
            `;
            resultsContainer.appendChild(itemDiv);
        });

        // 更新頂部的炫富統計數字
        totalCountDisplay.textContent = results.length.toLocaleString();
        totalAmountDisplay.textContent = 'NT$ ' + totalAmount.toLocaleString();
    }

    // 啟動時先讀取資料
    loadCampaignFinanceData();

    // ================= 事件綁定 =================
    searchBtn.addEventListener('click', () => {
        executeSearch(searchInput.value);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeSearch(searchInput.value);
    });

    exampleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const term = e.target.textContent;
            searchInput.value = term;
            executeSearch(term);
        });
    });

    backBtn.addEventListener('click', () => {
        resultsPage.classList.remove('active');
        landingPage.classList.add('active');
        searchInput.value = '';
    });
});
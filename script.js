document.addEventListener('DOMContentLoaded', () => {
    // ================= DOM 元素抓取 =================
    const landingPage = document.getElementById('landing-page');
    const resultsPage = document.getElementById('results-page');
    const searchBtn = document.getElementById('search-btn');
    const backBtn = document.getElementById('back-btn');
    const searchInput = document.getElementById('main-search');
    const searchTermDisplay = document.getElementById('search-term-display');
    // (已移除 exampleBtns 的抓取)

    const resultsContainer = document.getElementById('results-container');
    const totalAmountDisplay = document.getElementById('total-amount');
    const totalCountDisplay = document.getElementById('total-count');

    let rawData = []; // 用來裝黃金紀錄的保險箱

    // ================= 1. 讀取並解析 CSV 檔案 =================
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
            alert('⚠️ 讀取 A05_basic_all.csv 失敗！\n1. 請確認檔案有一起上傳到 GitHub。\n2. 檔名大小寫必須完全一致。');
        }
    }

    // 🛡️ 絕對防禦版的 CSV 解析器 (專門對付數字裡的逗號和引號)
    function parseCSV(text) {
        const lines = text.split(/\r?\n/);
        if (lines.length === 0) return [];
        
        // 抓第一行當標題
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // 跳過空行
            
            let values = [];
            let currentVal = '';
            let inQuotes = false;
            
            // 逐字元掃描，避開引號內的逗號陷阱
            for (let j = 0; j < lines[i].length; j++) {
                let char = lines[i][j];
                if (char === '"') {
                    inQuotes = !inQuotes; // 進入或離開引號區
                } else if (char === ',' && !inQuotes) {
                    values.push(currentVal.trim());
                    currentVal = ''; // 換下一個欄位
                } else {
                    currentVal += char;
                }
            }
            values.push(currentVal.trim()); // 推入最後一個欄位

            // 把標題和資料對應起來
            let rowObj = {};
            headers.forEach((header, index) => {
                // 如果該欄位有資料就存，沒有就給 '0'，順便清掉殘留的引號
                rowObj[header] = values[index] ? values[index].replace(/"/g, '') : '0';
            });
            data.push(rowObj);
        }
        return data;
    }

    // ================= 2. 執行搜尋邏輯 =================
    function executeSearch(term) {
        if (!term.trim()) {
            alert('請先輸入你要查的對象！金庫大門不會為空手而來的人打開！');
            return;
        }

        // 只要任一欄位有符合關鍵字就抓出來
        const results = rawData.filter(row => {
            return Object.values(row).some(value => value.includes(term));
        });

        renderResults(term, results);

        // 切換畫面
        landingPage.classList.remove('active');
        resultsPage.classList.add('active');
    }

    // ================= 3. 渲染奢華的搜尋結果 =================
    function renderResults(term, results) {
        searchTermDisplay.textContent = term;
        resultsContainer.innerHTML = ''; // 清空舊資料

        // 沒查到資料的窮光蛋畫面
        if (results.length === 0) {
            resultsContainer.innerHTML = '<h3 style="text-align:center; color:white; padding: 20px;">💸 這裡沒有他的黃金紀錄，他是個窮光蛋（或藏得很好）💸</h3>';
            totalAmountDisplay.textContent = 'NT$ 0';
            totalCountDisplay.textContent = '0';
            return;
        }

        let totalAmount = 0;

        // 印出每一筆資料的俗氣卡片
        results.forEach(row => {
            // 針對 A05_basic_all.csv 的專屬欄位抓取
            const candidate = row['姓名'] || '未知政客';
            const party = row['推薦政黨'] || '無黨籍';
            
            const amountStr = row['總收入'] || '0';
            const corpDonationStr = row['營利事業捐贈收入'] || '0';
            const personalDonationStr = row['個人捐贈收入'] || '0';

            // 拔除可能殘留的逗號，轉成純數字計算
            const amount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;
            const corpAmount = parseInt(corpDonationStr.replace(/\D/g, ''), 10) || 0;
            const personalAmount = parseInt(personalDonationStr.replace(/\D/g, ''), 10) || 0;

            totalAmount += amount; // 累加總金額

            // 建立卡片 HTML
            const itemDiv = document.createElement('div');
            itemDiv.className = 'result-item';
            itemDiv.innerHTML = `
                <div class="result-amount">NT$ ${amount.toLocaleString()}</div>
                <div class="result-details">
                    <strong>吸金政客：</strong> <span class="gold-text" style="font-size:1.2em;">${candidate}</span> (${party}) <br>
                    <strong>🏢 企業財團進貢：</strong> NT$ ${corpAmount.toLocaleString()} <br>
                    <strong>🧑‍🤝‍🧑 一般選民捐贈：</strong> NT$ ${personalAmount.toLocaleString()}
                </div>
            `;
            resultsContainer.appendChild(itemDiv);
        });

        // 更新最上方的土豪總計面板
        totalCountDisplay.textContent = results.length.toLocaleString();
        totalAmountDisplay.textContent = 'NT$ ' + totalAmount.toLocaleString();
    }

    // ================= 啟動與事件綁定 =================
    
    // 一開網頁就先偷偷去搬磚 (讀取 CSV)
    loadCampaignFinanceData();

    // 點擊搜尋按鈕
    searchBtn.addEventListener('click', () => {
        executeSearch(searchInput.value);
    });

    // 支援按 Enter 搜尋
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeSearch(searchInput.value);
    });

    // (已移除：下方範例按鈕的點擊事件)

    // 返回首頁按鈕
    backBtn.addEventListener('click', () => {
        resultsPage.classList.remove('active');
        landingPage.classList.add('active');
        searchInput.value = ''; // 清空搜尋框
    });
});
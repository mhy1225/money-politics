document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landing-page');
    const resultsPage = document.getElementById('results-page');
    const searchBtn = document.getElementById('search-btn');
    const backBtn = document.getElementById('back-btn');
    const searchInput = document.getElementById('main-search');
    const searchTermDisplay = document.getElementById('search-term-display');
    const exampleBtns = document.querySelectorAll('.example-btn');

    // 新增的 DOM 元素 (對應剛才 HTML 改的 ID)
    const resultsContainer = document.getElementById('results-container');
    const totalAmountDisplay = document.getElementById('total-amount');
    const totalCountDisplay = document.getElementById('total-count');

    let rawData = []; // 用來裝 CSV 的所有資料

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
            alert('⚠️ 讀取 A05_basic_all.csv 失敗！\n如果你是直接點擊兩下 HTML 檔案打開網頁，瀏覽器的安全機制會阻擋讀取本地檔案。請將網頁放上 GitHub Pages 或使用 VS Code 的 Live Server 擴充功能來瀏覽！');
        }
    }

    // 簡易的 CSV 解析器
    function parseCSV(text) {
        const lines = text.split(/\r?\n/);
        if (lines.length === 0) return [];
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            // 簡單切割逗號 (忽略引號內的逗號處理，適用於基本結構)
            const values = lines[i].split(',');
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

        // 搜尋邏輯：比對每一筆資料中的所有欄位，只要有符合的字就抓出來
        const results = rawData.filter(row => {
            return Object.values(row).some(value => value.includes(term));
        });

        renderResults(term, results);

        // 切換頁面
        landingPage.classList.remove('active');
        resultsPage.classList.add('active');
    }

    // 💰 3. 將資料渲染到網頁上
    function renderResults(term, results) {
        searchTermDisplay.textContent = term;
        resultsContainer.innerHTML = ''; // 清空舊結果

        if (results.length === 0) {
            resultsContainer.innerHTML = '<h3 style="text-align:center; color:white; padding: 20px;">💸 這裡沒有他的黃金紀錄，他是個窮光蛋（或藏得很好）💸</h3>';
            totalAmountDisplay.textContent = 'NT$ 0';
            totalCountDisplay.textContent = '0';
            return;
        }

        let totalAmount = 0;

        results.forEach(row => {
            // 自動猜測你的 CSV 欄位名稱 (根據台灣監察院常見格式)
            const amountStr = row['收入金額'] || row['金額'] || row['支出金額'] || '0';
            const donor = row['捐贈者'] || row['捐贈者/支出對象'] || row['姓名'] || row['捐贈者名稱'] || '神秘金主';
            const receiver = row['收受者'] || row['候選人'] || row['政黨'] || '某政客';
            const date = row['交易日期'] || row['日期'] || row['申報日期'] || '未知日期';

            // 把金額轉成純數字以便加總
            const amount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;
            totalAmount += amount;

            // 產生一筆俗氣的卡片
            const itemDiv = document.createElement('div');
            itemDiv.className = 'result-item';
            itemDiv.innerHTML = `
                <div class="result-amount">NT$ ${amount.toLocaleString()}</div>
                <div class="result-details">
                    <strong>捐贈者：</strong> ${donor} <br>
                    <strong>收受者：</strong> ${receiver} <br>
                    <strong>日期：</strong> ${date}
                </div>
            `;
            resultsContainer.appendChild(itemDiv);
        });

        // 更新頂部的炫富統計數字
        totalCountDisplay.textContent = results.length.toLocaleString();
        totalAmountDisplay.textContent = 'NT$ ' + totalAmount.toLocaleString();
    }

    // 一開網頁就偷偷去搬磚 (讀取 CSV)
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
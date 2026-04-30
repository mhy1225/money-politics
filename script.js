document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landing-page');
    const resultsPage = document.getElementById('results-page');
    const searchBtn = document.getElementById('search-btn');
    const backBtn = document.getElementById('back-btn');
    const searchInput = document.getElementById('main-search');
    const searchTermDisplay = document.getElementById('search-term-display');
    const exampleBtns = document.querySelectorAll('.example-btn');

    // 模擬讀取指定的資料檔案
    function loadCampaignFinanceData() {
        // 在實際環境中，您會使用 fetch 或 d3.csv 來解析這個檔案
        console.log('Loading dataset: A05_basic_all.csv');
        /* 
        fetch('A05_basic_all.csv')
            .then(response => response.text())
            .then(data => {
                // 處理 CSV 資料邏輯
                console.log("A05_basic_all.csv 載入成功");
            });
        */
    }

    // 執行搜尋並切換頁面
    function executeSearch(term) {
        if (!term.trim()) {
            alert('請先輸入你要查的對象！金庫大門不會為空手而來的人打開！');
            return;
        }

        // 觸發資料載入模擬
        loadCampaignFinanceData();

        // 顯示結果頁面
        searchTermDisplay.textContent = term;
        landingPage.classList.remove('active');
        resultsPage.classList.add('active');
    }

    // 綁定主搜尋按鈕
    searchBtn.addEventListener('click', () => {
        executeSearch(searchInput.value);
    });

    // 綁定範例按鈕
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const term = e.target.textContent;
            searchInput.value = term;
            executeSearch(term);
        });
    });

    // 返回首頁
    backBtn.addEventListener('click', () => {
        resultsPage.classList.remove('active');
        landingPage.classList.add('active');
        searchInput.value = ''; // 清空搜尋框
    });
});
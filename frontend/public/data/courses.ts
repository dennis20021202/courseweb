// 這是模擬後端資料庫的資料檔案
// 用於讓首頁與結帳頁面共用課程資訊

export interface Unit {
    id: string;
    title: string;
}

export interface Chapter {
    id: string;
    title: string;
    date?: string; // 預計開課時間
    units: Unit[];
}

export interface Course {
    id: number;
    title: string;
    author: string;
    description: string;
    longDescription?: string; // 購買頁面用的長描述
    image: string;
    tags: string[];
    highlight: boolean;
    promoText: string | null;
    buttonText: string;
    buttonStyle: "solid" | "outline";
    price: number;
    originalPrice: number;
    syllabus: Chapter[]; // 課綱
}

export const COURSES: Course[] = [
    {
        id: 1,
        title: "軟體設計模式精通之旅",
        author: "水球潘",
        description: "用一趟旅程的時間，成為硬核的 Coding 實戰高手。",
        longDescription: "這是一趟深入軟體設計模式的旅程...",
        image: "/images/course_0.png",
        tags: ["設計模式", "架構設計"],
        highlight: true,
        promoText: "看完課程介紹，立刻折價 3,000 元",
        buttonText: "立刻體驗",
        buttonStyle: "outline",
        price: 3990,
        originalPrice: 6990,
        syllabus: [
            {
                id: "c1",
                title: "啟程：物件導向基礎",
                units: [
                    { id: "u1", title: "單元 1：物件導向思維" },
                    { id: "u2", title: "單元 2：封裝、繼承、多型" },
                    { id: "u3", title: "單元 3：介面與抽象類別" }
                ]
            }
        ]
    },
    {
        id: 2,
        title: "AI x BDD：規格驅動全自動開發術",
        author: "水球潘",
        description: "AI Top 1% 工程師必修課，掌握規格驅動的全自動化開發。",
        longDescription: `這門課程要帶你「用半年的時間，徹底學會如何結合 TDD、BDD 與 AI，實現 100% 全自動化、高精準度的程式開發」。上完課後，你不只是理解方法，更能真正把 AI 落實到專案裡，從此不再困在無止盡的 Debug 與 Review，而是成為團隊裡能制定規格與標準的工程師。

在這趟學習過程中，你將透過影音課程、專屬社群、每週研討會與實戰演練，逐步掌握如何用規格驅動開發，讓 AI 自動完成從測試到程式修正的一整套流程。本課程將自 9/22 起每週陸續上架新單元，確保你能循序學習、穩定進步。現在購買僅需 NT$7,599 (原價 NT$15,999)，未來隨著開課內容完整，價格也會逐步上漲。

只要你願意跟著每週內容踏實學習，我能保證在半年內，你將能真正掌握 AI x BDD 的核心思維與實作方法，做到規格驅動、全自動化、高精準度的開發。這是大多數工程師甚至許多架構師都未曾系統性鍛鍊過的能力，而你將是那少數能用 AI 驅動專案的人。`,
        image: "/images/course_4.png",
        tags: ["AI", "BDD", "Cucumber"],
        highlight: false,
        promoText: null,
        buttonText: "立刻購買",
        buttonStyle: "solid",
        price: 7599,
        originalPrice: 15999,
        syllabus: [
            {
                id: "ch1",
                title: "規格驅動開發的前提",
                date: "2025/09/29",
                units: [
                    { id: "1", title: "單元 1：為什麼需要規格驅動？" },
                    { id: "2", title: "單元 2：環境建置與工具介紹" },
                    { id: "3", title: "單元 3：第一個 BDD 案例" }
                ]
            },
            {
                id: "ch2",
                title: "100% 全自動化開發的脈絡：規格的光譜",
                date: "2025/10/27",
                units: [
                    { id: "1", title: "單元 1：規格光譜解析" },
                    { id: "2", title: "單元 2：從自然語言到可執行規格" },
                    { id: "3", title: "單元 3：案例實作" }
                ]
            },
            {
                id: "ch3",
                title: "70% 自動化：測試驅動開發",
                date: "2025/11/03",
                units: [
                    { id: "1", title: "單元 1：TDD 核心循環" },
                    { id: "2", title: "單元 2：紅燈、綠燈、重構" },
                    { id: "3", title: "單元 3：AI 輔助 TDD" }
                ]
            },
            {
                id: "ch4",
                title: "80% 自動化：行為驅動開發 (BDD)",
                date: "2025/11/17",
                units: [
                    { id: "1", title: "單元 1：Cucumber 語法精解" },
                    { id: "2", title: "單元 2：撰寫高品質的 Gherkin" },
                    { id: "3", title: "單元 3：Step Definitions 實作" }
                ]
            },
            {
                id: "ch5",
                title: "90% 自動化：指令集架構之可執行規格",
                date: "2025/12/08",
                units: [
                    { id: "1", title: "單元 1：指令集架構設計" },
                    { id: "2", title: "單元 2：連接 AI Agent" },
                    { id: "3", title: "單元 3：自動化工作流" }
                ]
            },
            {
                id: "ch6",
                title: "99% 自動化：為企業打造專屬 BDD Master Agent",
                date: "2026/12/15",
                units: [
                    { id: "1", title: "單元 1：RAG 與知識庫建置" },
                    { id: "2", title: "單元 2：Agent Prompt Engineering" },
                    { id: "3", title: "單元 3：企業級部署策略" }
                ]
            },
            {
                id: "ch7",
                title: "100% 自動化：超 AI 化",
                date: "2026/02/01",
                units: [
                    { id: "1", title: "單元 1：未來的開發模式" },
                    { id: "2", title: "單元 2：人機協作的極致" },
                    { id: "3", title: "單元 3：結業專案展示" }
                ]
            }
        ]
    }
];
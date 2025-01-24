import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5 text-red-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  </div>
);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getPrediction = async (matchData) => {
  try {
    const response = await api.post("/predict", matchData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Sunucu hatası: ${error.response.status}`);
    } else if (error.request) {
      throw new Error("Sunucuya ulaşılamıyor");
    } else {
      throw new Error("İstek oluşturulurken hata oluştu");
    }
  }
};

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setDarkMode(true);
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 transition-colors duration-200"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? (
        <svg
          className="w-6 h-6 text-yellow-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
};

const FormGroup = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  step,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      step={step}
      placeholder={placeholder}
      className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
    />
  </div>
);

const StatisticGroup = ({ title, children }) => (
  <div className="mb-8">
    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
      {title}
    </h4>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{children}</div>
  </div>
);

const BetPredictionApp = () => {
  const [formData, setFormData] = useState({
    league: "",
    date: "",
    homeTeam: "",
    awayTeam: "",
    firstHalfScore: "",
    homeShots: "",
    awayShots: "",
    homeOnTarget: "",
    awayOnTarget: "",
    homePossession: "",
    awayPossession: "",
    homeCorners: "",
    awayCorners: "",
    homeYellow: "",
    awayYellow: "",
    homeRed: "",
    awayRed: "",
    homeFouls: "",
    awayFouls: "",
    liveCommentary: "",
    homeXG: "",
    awayXG: "",
    homeBigChances: "",
    awayBigChances: "",
    homePasses: "",
    awayPasses: "",
    homeTackles: "",
    awayTackles: "",
    homeBlockedShots: "",
    awayBlockedShots: "",
    homeShotsInsideBox: "",
    awayShotsInsideBox: "",
  });

  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [predictionHistory, setPredictionHistory] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPrediction("");

    try {
      const matchDescription = `
        Lig: ${formData.league}
        Tarih: ${formData.date}
        Ev Sahibi: ${formData.homeTeam}
        Deplasman: ${formData.awayTeam}
        İlk Yarı Skoru: ${formData.firstHalfScore}
        
        İstatistikler (İlk Yarı):
        xG (Ev/Dep): ${formData.homeXG}-${formData.awayXG}
        Büyük Şans (Ev/Dep): ${formData.homeBigChances}-${formData.awayBigChances}
        Şutlar (Ev/Dep): ${formData.homeShots}-${formData.awayShots}
        Ceza Sahası İçi Şut (Ev/Dep): ${formData.homeShotsInsideBox}-${formData.awayShotsInsideBox}
        İsabetli Şutlar (Ev/Dep): ${formData.homeOnTarget}-${formData.awayOnTarget}
        Bloke Edilen Şutlar (Ev/Dep): ${formData.homeBlockedShots}-${formData.awayBlockedShots}
        Paslar (Ev/Dep): ${formData.homePasses}-${formData.awayPasses}
        Müdahaleler (Ev/Dep): ${formData.homeTackles}-${formData.awayTackles}
        Top Hakimiyeti % (Ev/Dep): ${formData.homePossession}-${formData.awayPossession}
        Kornerler (Ev/Dep): ${formData.homeCorners}-${formData.awayCorners}
        Sarı Kartlar (Ev/Dep): ${formData.homeYellow}-${formData.awayYellow}
        Kırmızı Kartlar (Ev/Dep): ${formData.homeRed}-${formData.awayRed}
        Fauller (Ev/Dep): ${formData.homeFouls}-${formData.awayFouls}
        
        Maç Anlatımı:
        ${formData.liveCommentary}
      `;

      const prompt = `Bu maçın ilk yarısı ${formData.firstHalfScore} skoruyla tamamlanmıştır. Verilen istatistikler ilk yarıya aittir. İkinci yarı için aşağıdaki bahis türlerini analiz et ve en mantıklı tahminleri yap:

1. Maç Sonucu (1-0-2)
2. İkinci Yarı Gol Sayısı Alt/Üst bahisleri (0.5, 1.5, 2.5)
3. Toplam Gol Sayısı (Mevcut ${formData.firstHalfScore} skoru üzerine)
4. İkinci Yarıda Karşılıklı Gol (Var/Yok)
5. İkinci Yarı Korner Alt/Üst
6. İkinci Yarı Kart Alt/Üst
7. Handikaplı Maç Sonucu

ÖNEMLİ NOTLAR:
- İlk yarı skoru ${formData.firstHalfScore}'dır. Bu skor üzerine tahmin yapılmalıdır.
- Toplam gol bahisleri için ilk yarıdaki golleri hesaba katmayı unutma.
- Sadece mantıklı ve mümkün olan bahis seçeneklerini öner.
- Her tahmin için güven derecesi belirt (düşük/orta/yüksek) ve seçiminin gerekçelerini açıkla.

Maç Verileri:
${matchDescription}`;

      const fullUrl = `${process.env.REACT_APP_API_URL}?key=${process.env.REACT_APP_API_KEY}`;

      const response = await axios.post(
        fullUrl,
        {
          contents: [
            {
              parts: [{ text: prompt + "\n\n" + matchDescription }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        setPrediction(response.data.candidates[0].content.parts[0].text);
        savePrediction(response.data.candidates[0].content.parts[0].text);
      } else {
        throw new Error("API'den geçerli bir yanıt alınamadı");
      }
    } catch (err) {
      console.error("Hata detayı:", err);

      if (err.response) {
        setError(
          `Sunucu hatası: ${err.response.status} - ${
            err.response.data?.error?.message || "Bilinmeyen hata"
          }`
        );
      } else if (err.request) {
        setError(
          "Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin."
        );
      } else {
        setError("Bir hata oluştu: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const savePrediction = (prediction) => {
    const newPrediction = {
      id: Date.now(),
      date: formData.date,
      teams: `${formData.homeTeam} vs ${formData.awayTeam}`,
      prediction: prediction,
      timestamp: new Date().toISOString(),
    };
    setPredictionHistory((prev) => [newPrediction, ...prev]);
    localStorage.setItem(
      "predictionHistory",
      JSON.stringify([newPrediction, ...predictionHistory])
    );
  };

  const memoizedPrediction = useMemo(
    () => <ReactMarkdown>{prediction}</ReactMarkdown>,
    [prediction]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <DarkModeToggle />
      <div className="max-w-6xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white">
          Bahis Tahmin Uygulaması
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white/90 dark:bg-gray-700/90 p-6 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <FormGroup
              label="Lig"
              name="league"
              value={formData.league}
              onChange={handleInputChange}
            />
            <FormGroup
              label="Tarih"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
            />
            <FormGroup
              label="Ev Sahibi Takım"
              name="homeTeam"
              value={formData.homeTeam}
              onChange={handleInputChange}
            />
            <FormGroup
              label="Deplasman Takım"
              name="awayTeam"
              value={formData.awayTeam}
              onChange={handleInputChange}
            />
          </div>

          <div className="bg-white/90 dark:bg-gray-700/90 p-8 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Maç İstatistikleri
            </h3>

            <StatisticGroup title="Skor ve Temel İstatistikler">
              <FormGroup
                label="İlk Yarı Skoru"
                name="firstHalfScore"
                value={formData.firstHalfScore}
                onChange={handleInputChange}
                placeholder="0-0"
              />
              <FormGroup
                label="xG (Ev)"
                name="homeXG"
                type="number"
                step="0.01"
                value={formData.homeXG}
                onChange={handleInputChange}
              />
              <FormGroup
                label="xG (Dep)"
                name="awayXG"
                type="number"
                step="0.01"
                value={formData.awayXG}
                onChange={handleInputChange}
              />
            </StatisticGroup>

            <StatisticGroup title="Şut İstatistikleri">
              <FormGroup
                label="Şut (Ev)"
                name="homeShots"
                type="number"
                value={formData.homeShots}
                onChange={handleInputChange}
              />
              <FormGroup
                label="Şut (Dep)"
                name="awayShots"
                type="number"
                value={formData.awayShots}
                onChange={handleInputChange}
              />
              <FormGroup
                label="İsabetli Şut (Ev)"
                name="homeOnTarget"
                type="number"
                value={formData.homeOnTarget}
                onChange={handleInputChange}
              />
              <FormGroup
                label="İsabetli Şut (Dep)"
                name="awayOnTarget"
                type="number"
                value={formData.awayOnTarget}
                onChange={handleInputChange}
              />
              <FormGroup
                label="Ceza Sahası İçi Şut (Ev)"
                name="homeShotsInsideBox"
                type="number"
                value={formData.homeShotsInsideBox}
                onChange={handleInputChange}
              />
              <FormGroup
                label="Ceza Sahası İçi Şut (Dep)"
                name="awayShotsInsideBox"
                type="number"
                value={formData.awayShotsInsideBox}
                onChange={handleInputChange}
              />
            </StatisticGroup>

            <StatisticGroup title="Oyun Kontrolü">
              <FormGroup
                label="Top Hakimiyeti % (Ev)"
                name="homePossession"
                type="number"
                value={formData.homePossession}
                onChange={handleInputChange}
              />
              <FormGroup
                label="Top Hakimiyeti % (Dep)"
                name="awayPossession"
                type="number"
                value={formData.awayPossession}
                onChange={handleInputChange}
              />
              <FormGroup
                label="Pas (Ev)"
                name="homePasses"
                type="number"
                value={formData.homePasses}
                onChange={handleInputChange}
              />
              <FormGroup
                label="Pas (Dep)"
                name="awayPasses"
                type="number"
                value={formData.awayPasses}
                onChange={handleInputChange}
              />
            </StatisticGroup>

            <StatisticGroup title="Standart Pozisyonlar ve Disiplin">
              <FormGroup
                label="Korner (Ev)"
                name="homeCorners"
                type="number"
                value={formData.homeCorners}
                onChange={handleInputChange}
              />
              <FormGroup
                label="Korner (Dep)"
                name="awayCorners"
                type="number"
                value={formData.awayCorners}
                onChange={handleInputChange}
              />
              <FormGroup
                label="Sarı Kart (Ev)"
                name="homeYellow"
                type="number"
                value={formData.homeYellow}
                onChange={handleInputChange}
              />
              <FormGroup
                label="Sarı Kart (Dep)"
                name="awayYellow"
                type="number"
                value={formData.awayYellow}
                onChange={handleInputChange}
              />
              <FormGroup
                label="Kırmızı Kart (Ev)"
                name="homeRed"
                type="number"
                value={formData.homeRed}
                onChange={handleInputChange}
              />
              <FormGroup
                label="Kırmızı Kart (Dep)"
                name="awayRed"
                type="number"
                value={formData.awayRed}
                onChange={handleInputChange}
              />
            </StatisticGroup>
          </div>

          <div className="bg-white/90 dark:bg-gray-700/90 p-6 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Maç Anlatımı
            </label>
            <textarea
              name="liveCommentary"
              value={formData.liveCommentary}
              onChange={handleInputChange}
              rows={5}
              className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-4 py-2 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Maç anlatımını buraya giriniz..."
            />
          </div>

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300 shadow-sm"
            >
              {loading ? <LoadingSpinner /> : "Tahmin Al"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {prediction && (
          <div className="mt-6 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 p-6 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Tahmin Sonucu:
            </h3>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              {memoizedPrediction}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetPredictionApp;

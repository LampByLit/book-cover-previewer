import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";

// Book cover designs - single wraparound images (front + spine + back)
const covers = [
  "1.png",
  "2.png",
  "A0.png",
  "A1.png",
  "A2.png",
  "A3.png",
  "A4.png",
  "B0.png",
  "B1.png",
  "B2.png",
  "C0.png",
  "C1.png",
  "C3.png",
  "C4.png",
  "C5.png",
  "C6.png",
  "D0.png",
  "D1.png",
  "D2.png",
  "D3.png",
  "D4.png",
];

export const coverAtom = atom(0); // Current selected cover index
export const bookOpenAtom = atom(false); // Book open/closed state
export const sidebarVisibleAtom = atom(true); // Thumbnail sidebar visibility

export { covers };

export const UI = () => {
  const [selectedCover, setSelectedCover] = useAtom(coverAtom);
  const [bookOpen, setBookOpen] = useAtom(bookOpenAtom);
  const [sidebarVisible, setSidebarVisible] = useAtom(sidebarVisibleAtom);
  const [loading, setLoading] = useState(false);

  const handleCoverChange = (index) => {
    if (index === selectedCover) return;
    setLoading(true);
    setTimeout(() => {
      setSelectedCover(index);
      setLoading(false);
    }, 300);
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="w-8 md:w-16" /> {/* Spacer for centering */}
          <h1 className="text-black text-xl md:text-3xl font-bold tracking-wider">
            MIXTAPE HYPERBOREA
          </h1>
          <a
            href="https://lampbylit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto"
          >
            <img
              src="https://lampbylit.com/magazine/wp-content/uploads/2020/12/logo01.png"
              alt="LampByLit"
              className="h-12 md:h-16 w-auto"
            />
          </a>
        </div>
      </header>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarVisible(!sidebarVisible)}
        className="fixed top-1/2 -translate-y-1/2 z-30 pointer-events-auto bg-gray-800/80 hover:bg-gray-700/90 text-white px-2 md:px-3 py-4 md:py-6 rounded-r-lg transition-all duration-300 text-sm md:text-base"
        style={{ left: sidebarVisible ? "min(300px, 80vw)" : "4px" }}
      >
        {sidebarVisible ? "◀" : "▶"}
      </button>

      {/* Thumbnail Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-10 bg-white shadow-2xl transition-transform duration-300 ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "min(300px, 80vw)" }}
      >
        <div className="h-full overflow-y-auto pt-4 pb-8 px-4">
          <div className="space-y-4">
            {covers.map((cover, index) => (
              <button
                key={index}
                onClick={() => handleCoverChange(index)}
                className={`w-full pointer-events-auto transition-all duration-300 rounded-lg overflow-hidden ${
                  selectedCover === index
                    ? "ring-4 ring-blue-500 shadow-xl"
                    : "ring-2 ring-gray-300 hover:ring-gray-500"
                }`}
              >
                <img
                  src={`/covers/${cover}`}
                  alt={`Cover ${index + 1}`}
                  className="w-full h-auto"
                />
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Book Controls */}
      <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <button
          onClick={() => setBookOpen(!bookOpen)}
          className="pointer-events-auto bg-gray-800/80 hover:bg-gray-700/90 text-white px-6 md:px-8 py-2 md:py-3 rounded-full transition-all duration-300 font-medium text-sm md:text-base"
        >
          {bookOpen ? "Close Book" : "Open Book"}
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </>
  );
};

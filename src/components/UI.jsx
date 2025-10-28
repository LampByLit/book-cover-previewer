import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { UploadComponent } from "./UploadComponent";
import { getAllCovers, getCoverDisplayInfo, getCoverImageUrl } from "../utils/coverData";

// Automatically detect all images in the covers directory
// Vite's import.meta.glob returns modules, we extract just the paths
const coverModules = import.meta.glob('/public/covers/*.{png,jpg,jpeg,webp}', { eager: true, as: 'url' });
const covers = Object.keys(coverModules)
  .map(path => path.replace('/public/covers/', ''))
  .sort(); // Sort alphabetically for consistent ordering

export const coverAtom = atom(null); // Current selected cover ID
export const bookOpenAtom = atom(false); // Book open/closed state
export const sidebarVisibleAtom = atom(true); // Thumbnail sidebar visibility

export { covers };

export const UI = ({ experienceRef }) => {
  const [selectedCoverId, setSelectedCoverId] = useAtom(coverAtom);
  const [bookOpen, setBookOpen] = useAtom(bookOpenAtom);
  const [sidebarVisible, setSidebarVisible] = useAtom(sidebarVisibleAtom);
  const [loading, setLoading] = useState(false);
  const [uploadedCovers, setUploadedCovers] = useState([]);

  // Load covers on component mount
  useEffect(() => {
    const covers = getAllCovers();
    setUploadedCovers(covers);
    // Default selection on first load
    if (!selectedCoverId && covers.length > 0) {
      setSelectedCoverId(covers[0].id);
    }
  }, []);

  const handleCoverChange = (coverId) => {
    if (coverId === selectedCoverId) return;
    setLoading(true);
    setTimeout(() => {
      setSelectedCoverId(coverId);
      setLoading(false);
    }, 300);
  };

  const handleUploadSuccess = (newCover) => {
    const covers = getAllCovers();
    setUploadedCovers(covers);
    setSelectedCoverId(newCover.id);
  };

  const handleUploadError = (error) => {
    console.error('Upload error:', error);
    // Could add toast notification here
  };

  const handleNextCover = () => {
    if (uploadedCovers.length === 0) return;
    const currentIndex = uploadedCovers.findIndex(cover => cover.id === selectedCoverId);
    const nextIndex = (currentIndex + 1) % uploadedCovers.length;
    handleCoverChange(uploadedCovers[nextIndex].id);
  };

  const handlePreviousCover = () => {
    if (uploadedCovers.length === 0) return;
    const currentIndex = uploadedCovers.findIndex(cover => cover.id === selectedCoverId);
    const prevIndex = currentIndex === 0 ? uploadedCovers.length - 1 : currentIndex - 1;
    handleCoverChange(uploadedCovers[prevIndex].id);
  };

  const handleCenterView = () => {
    if (experienceRef.current) {
      experienceRef.current.resetCamera();
    }
  };

  return (
    <>
      {/* Header - hidden on mobile when sidebar is open */}
      <header className={`fixed top-0 left-0 right-0 z-20 pointer-events-none transition-opacity duration-300 ${
        sidebarVisible ? "md:opacity-100 opacity-0" : "opacity-100"
      }`}>
        <div className="flex items-center justify-end p-4 md:p-6">
          <a
            href="https://lampbylit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto shrink-0"
          >
            <img
              src="https://lampbylit.com/magazine/wp-content/uploads/2020/12/logo01.png"
              alt="LampByLit"
              className="h-12 md:h-16 w-auto object-contain"
            />
          </a>
        </div>
      </header>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarVisible(!sidebarVisible)}
        className="fixed top-1/2 -translate-y-1/2 z-30 pointer-events-auto bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 active:from-slate-900 active:to-slate-800 text-white p-3 md:p-4 rounded-r-xl transition-all duration-200 shadow-2xl hover:shadow-3xl active:shadow-xl border border-slate-600/50 hover:border-slate-500/50 active:border-slate-400/50 backdrop-blur-sm md:min-w-[48px] md:min-h-[48px] min-w-[56px] min-h-[56px]"
        style={{
          left: sidebarVisible ? "min(300px, 80vw)" : "4px"
        }}
        title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
        aria-label={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
      >
        <div className="flex items-center justify-center">
          {sidebarVisible ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 hover:scale-110"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 hover:scale-110"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </div>
      </button>

      {/* Thumbnail Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-10 bg-white shadow-2xl transition-transform duration-300 ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "min(300px, 80vw)" }}
      >
        <div className="h-full overflow-y-auto pt-4 pb-8 px-4">
          {/* Upload Component */}
          <UploadComponent
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />

          {/* Cover Thumbnails */}
          <div className="space-y-4">
            {uploadedCovers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No covers uploaded yet</p>
                <p className="text-sm">Upload a cover above to get started</p>
              </div>
            ) : (
              uploadedCovers.map((cover) => {
                const displayInfo = getCoverDisplayInfo(cover);
                return (
                  <div key={cover.id} className="relative group">
                    <button
                      onClick={() => handleCoverChange(cover.id)}
                      className={`w-full pointer-events-auto transition-all duration-300 rounded-lg overflow-hidden ${
                        selectedCoverId === cover.id
                          ? "ring-4 ring-blue-500 shadow-xl"
                          : "ring-2 ring-gray-300 hover:ring-gray-500"
                      }`}
                    >
                      <img
                        src={getCoverImageUrl(cover) || "/images/wawasensei-white.png"}
                        alt={displayInfo.displayName}
                        className="w-full h-auto"
                      />
                      {/* Trim size overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2">
                        <div className="font-medium">{displayInfo.trimSizeDisplay}</div>
                        <div className="text-gray-300">{displayInfo.presetName}</div>
                      </div>
                    </button>

                    {/* Full Image View Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering cover change
                        const url = getCoverImageUrl(cover) || `/images/wawasensei-white.png`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full text-xs"
                      title="View full image in new tab"
                      aria-label={`View full size of ${displayInfo.displayName} in new tab`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15,3 21,3 21,9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Book Controls */}
      <div className={`fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-300 ${
        sidebarVisible ? "opacity-0 md:opacity-100" : "opacity-100"
      }`}>
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          {/* Navigation Group */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Previous Cover Button */}
            <button
              onClick={handlePreviousCover}
              className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 active:from-slate-800 active:to-slate-800 text-white p-3 md:p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl active:shadow-md border border-slate-600/50 hover:border-slate-500/50"
              title="Previous cover"
              aria-label="Go to previous cover"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 hover:scale-110"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Center View Button */}
            <button
              onClick={handleCenterView}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-700 text-white p-2.5 md:p-3.5 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl active:shadow-md border border-blue-500/50 hover:border-blue-400/50"
              title="Center view"
              aria-label="Center and reset camera view"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 hover:scale-110"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </button>

            {/* Next Cover Button */}
            <button
              onClick={handleNextCover}
              className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 active:from-slate-800 active:to-slate-800 text-white p-3 md:p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl active:shadow-md border border-slate-600/50 hover:border-slate-500/50"
              title="Next cover"
              aria-label="Go to next cover"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 hover:scale-110"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Separator */}
          <div className="w-px h-8 md:h-10 bg-slate-600/50 mx-1" />

          {/* Open/Close Book Button */}
        <button
          onClick={() => setBookOpen(!bookOpen)}
            className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 active:from-slate-900 active:to-slate-800 text-white px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl active:shadow-md border border-slate-600/50 hover:border-slate-500/50 font-medium text-sm md:text-base min-w-[140px] md:min-w-[160px]"
        >
          {bookOpen ? "Close Book" : "Open Book"}
        </button>
        </div>
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

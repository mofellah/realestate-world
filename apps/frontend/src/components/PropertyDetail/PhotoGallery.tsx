/**
 * Photo Gallery
 * Lightbox-enabled image gallery for property details.
 */

import { useMemo, useState } from "react";
import ImageGallery from "react-image-gallery";

interface PhotoGalleryProps {
  photos: string[];
  title?: string;
}

export default function PhotoGallery({ photos, title = "Property photos" }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = useMemo(
    () =>
      photos.map((url) => ({
        original: url,
        thumbnail: url,
        originalAlt: title,
        thumbnailAlt: title,
      })),
    [photos, title],
  );

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md h-96">
        <span className="text-gray-500 dark:text-gray-300">No photos available</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <ImageGallery
        items={images}
        showPlayButton={false}
        showNav={true}
        showFullscreenButton={true}
        showThumbnails={images.length > 1}
        onSlide={(index) => setCurrentIndex(index)}
        lazyLoad={true}
      />
      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}

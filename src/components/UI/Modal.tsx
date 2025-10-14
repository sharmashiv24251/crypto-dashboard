import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  backdropClassName?: string;
  modalClassName?: string;
  contentClassName?: string;
  showShadow?: boolean;
  container?: Element | null;
};

const defaultBackdrop =
  "fixed inset-0 flex items-center justify-center transition-opacity";
const defaultBackdropInner = "absolute inset-0 bg-background/85";
const defaultModal =
  "relative z-50 max-w-[760px] w-full mx-4 rounded-md bg-white";
const defaultShadow = "shadow-2xl";

export default function Modal({
  isOpen,
  onClose,
  children,
  closeOnEsc = true,
  closeOnBackdrop = true,
  backdropClassName = defaultBackdrop,
  modalClassName = defaultModal,
  contentClassName = "",
  showShadow = true,
  container = typeof document !== "undefined" ? document.body : null,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // prevent body scroll
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // ESC handler
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen || !container) return null;

  // NEW: use modalRef to determine whether the click was inside the modal.
  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) return;

    // If the click target is inside the modal element, do nothing.
    const modalEl = modalRef.current;
    const target = e.target as Node | null;
    if (modalEl && target && modalEl.contains(target)) {
      return;
    }

    // Otherwise close
    onClose();
  };

  return createPortal(
    <div
      ref={wrapperRef}
      className={backdropClassName}
      onMouseDown={handleBackdropMouseDown}
      aria-hidden={!isOpen}
    >
      {/* visual overlay — keep this separate for styling */}
      <div className={defaultBackdropInner} />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className={`${modalClassName} ${
          showShadow ? defaultShadow : ""
        } ${contentClassName}`}
        // don't stopPropagation here — we rely on modalRef.contains to detect inside clicks
        style={{ zIndex: 999 }}
      >
        {children}
      </div>
    </div>,
    container
  );
}

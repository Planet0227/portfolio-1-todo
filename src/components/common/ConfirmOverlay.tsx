import { ReactNode } from "react";

interface ConfirmOverlayProps {
  isOpen: true;
  title : string;
  description: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmOverlay: React.FC<ConfirmOverlayProps> = ({
  isOpen,
  title ,
  description,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "キャンセル",
}) => {
  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
      <div className="p-6 bg-white rounded shadow-lg">
        {title && <h2 className="mb-4 text-xl font-bold">{title}</h2>}
        <div className="mb-4 text-center">
          {description}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border hover:bg-gray-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOverlay;
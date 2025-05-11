import { SignatureModalProps, SignaturePadRef } from "@/lib/types";
import { Cross2Icon } from "@radix-ui/react-icons";
import SignaturePad from "react-signature-pad-wrapper";
export const SignatureModal = ({
  showSignatureModal,
  handleCloseModal,
  signaturePadRef,
  signatureSize,
  setSignatureSize,
  handleClearSignature,
  handleSaveSignature,
}: SignatureModalProps) =>
  showSignatureModal && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[90vw] sm:max-w-md p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-zinc-900">
            Draw Signature
          </h2>
          <button
            onClick={handleCloseModal}
            className="text-zinc-500 hover:text-zinc-700"
          >
            <Cross2Icon className="w-5 h-5" />
          </button>
        </div>

        <div className="border border-zinc-200 rounded-md overflow-hidden">
          <SignaturePad
            ref={signaturePadRef}
            options={{
              minWidth: 1,
              maxWidth: 3,
              penColor: "black",
              backgroundColor: "rgb(255, 255, 255)",
            }}
            canvasProps={{
              width: "400",
              height: "200",
              className: "w-full h-[150px] sm:h-[200px]",
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-600">Signature Size</label>
          <div className="flex gap-4">
            <input
              type="range"
              min="100"
              max="400"
              value={signatureSize.width}
              onChange={(e) =>
                setSignatureSize({
                  width: Number(e.target.value),
                  height: Number(e.target.value) / 2,
                })
              }
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-zinc-600 hover:text-zinc-900"
            onClick={handleClearSignature}
          >
            Clear
          </button>
          <button
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-zinc-900 text-white text-xs sm:text-sm rounded-md hover:bg-zinc-800"
            onClick={handleSaveSignature}
          >
            Add Signature
          </button>
        </div>
      </div>
    </div>
  );

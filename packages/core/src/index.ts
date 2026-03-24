/**
 * @splitforge/core
 *
 * Public API for the SplitForge text-splitting engine.
 * All exports are pure functions with no I/O or side-effects.
 */

export {
  countCharacters,
  estimateFileCount,
  byteSizeLabel,
  validateCharLimit,
} from "./textCounter";

export {
  splitText,
  splitExact,
  splitSmart,
  previewChunks,
} from "./splitter";

export type { SplitMode, SplitResult } from "./splitter";

export {
  getFileName,
  getAllFileNames,
  sanitizePrefix,
  generateSubfolderName,
  validateOutputPath,
} from "./fileNaming";

export type { FileNamingOptions } from "./fileNaming";

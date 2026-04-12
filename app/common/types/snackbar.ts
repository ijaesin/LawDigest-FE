import { SNACKBAR_TYPE } from '../constants/snackbar';

export type SnackbarType = (typeof SNACKBAR_TYPE)[keyof typeof SNACKBAR_TYPE];

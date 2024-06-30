import PropTypes, { ReactElement } from "prop-types";

type RefType = ((instance: unknown) => void) | { current: ReactElement };

export default {
  refType: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.elementType })
  ]) as PropTypes.Requireable<RefType>
};

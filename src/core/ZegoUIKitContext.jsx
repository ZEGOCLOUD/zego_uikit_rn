import React from 'react';

export const ZegoUIKitContext = React.createContext();

const withZegoUIKitContext = (OriginalComponent, mapStoreToProps) => {
  const ContextAwareComponent = (props) => (
    <ZegoUIKitContext.Consumer>
      {(context) => {
        if (mapStoreToProps && typeof mapStoreToProps !== 'function') {
          // eslint-disable-next-line no-console
          console.warn('Second parameter to withZegoUIKitContext must be a pure function');
        }
        const mergedProps = (mapStoreToProps && typeof mapStoreToProps === 'function')
          ? { ...mapStoreToProps(context), ...props }
          : { ...context, ...props };
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <OriginalComponent {...mergedProps} />;
      }}
    </ZegoUIKitContext.Consumer>
  );

  const componentName = OriginalComponent.displayName || OriginalComponent.name || 'Component';
  ContextAwareComponent.displayName = `ZegoAware${componentName}`;

  return ContextAwareComponent;
};

export default withZegoUIKitContext;

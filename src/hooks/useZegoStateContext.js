/**
 * Example:
 * const MyComponent = () => {
 *  const context = useZegoStateContext();
 *  const sdk = zegoSelectors.getSdk(context);
 *  return (<div>...</div>);
 * }
 */
 import { useContext } from 'react';

 import { ZegoUIKitContext } from '../lib/ZegoUIKitContext';
 
 function useZegoStateContext () {
   const context = useContext(ZegoUIKitContext);
   return context;
 }
 
 export default useZegoStateContext;
 
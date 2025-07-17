'use client'
import { WrappedMoorhen } from './WrappedMoorhen';
import  MoorhenWrapper from './MoorhenWrapper';
import { Provider } from 'react-redux';
import { MoorhenReduxStore } from 'moorhen'

const fileIds = ["5a3h","4dfr"]
export const Client = () => {
  return (
      <Provider store={MoorhenReduxStore}>
          <MoorhenWrapper fileIds={fileIds}/>
      </Provider>
  )
}

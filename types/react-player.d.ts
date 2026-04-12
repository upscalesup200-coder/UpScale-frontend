declare module 'react-player/youtube' {
  import { Component } from 'react';
  import { ReactPlayerProps } from 'react-player';
  
  export default class ReactPlayer extends Component<ReactPlayerProps, any> {
    seekTo(amount: number, type?: 'seconds' | 'fraction'): void;
    getCurrentTime(): number;
    getDuration(): number;
    getInternalPlayer(key?: string): any;
  }
}
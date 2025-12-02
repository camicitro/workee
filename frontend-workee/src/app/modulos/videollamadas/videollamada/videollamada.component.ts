import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-videollamada',
  standalone: true,
  template: `<div #jitsiContainer style="height: 600px; width: 100%;"></div>`
})
export class VideollamadaComponent implements OnInit, OnDestroy {
  @ViewChild('jitsiContainer', { static: true }) jitsiContainer!: ElementRef;
  api: any;

  isAudioMuted = false;
  isVideoMuted = false;

  domain: string = 'workeemeetings.online';

  ngOnInit() {
    const options = {
      roomName: "prueba",
      width: '100%',
      height: '100%',
      parentNode: this.jitsiContainer.nativeElement,
      configOverwrite: {
        prejoinPageEnabled: false
      },
      // interfaceConfigOverwrite: {
      //   TOOLBAR_BUTTONS: [
      //     'microphone', 'camera', 'hangup', 'chat'
      //   ]
      // }
    };
    this.api = new JitsiMeetExternalAPI(this.domain, options);
  }

  ngOnDestroy() {
    if (this.api) {
      this.api.dispose();
    }
  }

  executeCommand(command: string) {
    this.api.executeCommand(command);

    if (command == 'toggleAudio') {
      this.isAudioMuted = !this.isAudioMuted;
    }
    if (command == 'toggleVideo') {
      this.isVideoMuted = !this.isVideoMuted;
    }
  }

}
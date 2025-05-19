class CameraHandler {
  constructor(videoElement, canvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.stream = null;
    this.constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };
    
    // Tambahkan event listener untuk membersihkan kamera saat navigasi
    this.setupCleanupEvents();
  }

  setupCleanupEvents() {
    // Event ketika halaman akan ditinggalkan
    window.addEventListener('beforeunload', this.handlePageLeave.bind(this));
    
    // Event untuk single-page application routing changes
    window.addEventListener('popstate', this.handlePageLeave.bind(this));
    
    // Jika menggunakan React dan memiliki akses komponen lifecycle
    // Tambahkan ini ke componentWillUnmount atau useEffect cleanup di komponen
  }
  
  handlePageLeave() {
    // Pastikan kamera dimatikan ketika user meninggalkan halaman
    this.stopCamera();
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();
      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw error;
    }
  }

  stopCamera() {
    if (this.stream) {
      const tracks = this.stream.getTracks();
      tracks.forEach(track => track.stop());
      this.videoElement.srcObject = null;
      this.stream = null;
    }
  }

  capturePhoto() {
    const context = this.canvasElement.getContext('2d');
    this.canvasElement.width = this.videoElement.videoWidth;
    this.canvasElement.height = this.videoElement.videoHeight;
    context.drawImage(this.videoElement, 0, 0);
    
    return new Promise((resolve) => {
      this.canvasElement.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    });
  }

  switchCamera() {
    const currentFacingMode = this.constraints.video.facingMode;
    this.constraints.video.facingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    this.stopCamera();
    return this.startCamera();
  }
  
  // Metode untuk dihubungkan dengan form submit
  onFormCancel() {
    // Panggil saat user membatalkan/keluar dari form
    this.stopCamera();
  }
}

export default CameraHandler;
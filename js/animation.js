// js/animation.js

// Fungsi Easing Out Cubic untuk deselerasi yang mulus
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Memutar roda 3D ke pemenang tertentu secara animatif
 * @param {Object} winnerObject - Obj pemenang dari participantsData
 * @param {Array} participants - Total list peserta aktif
 * @param {number} duration - Durasi animasi dalam milidetik (default: 5000ms)
 * @returns {Promise<Object>} Mengembalikan promise yang resolve saat roda berhenti
 */
function spinToWinner(winnerObject, participants, duration = 5000) {
  return new Promise((resolve) => {
    if (!wheelMesh || participants.length === 0) {
      resolve(winnerObject);
      return;
    }

    const totalParticipants = participants.length;
    const winnerIndex = participants.findIndex(p => p.rowIndex === winnerObject.rowIndex);

    if (winnerIndex === -1) {
      resolve(winnerObject);
      return;
    }

    // Hitung Sudut Segmen
    const segmentAngle = (Math.PI * 2) / totalParticipants;

    // Jarum 3D berada di posisi Atas (Sudut PI/2 relatif terhadap ruang Three.js)
    // Hitung target rotasi Z agar segmen pemenang berhenti tepat di jarum
    const targetSegmentCenter = (winnerIndex * segmentAngle) + (segmentAngle / 2);
    const pointerOffset = Math.PI / 2;
    
    // Tambahkan minimal 5-8 kali putaran penuh (extra spins) agar animasi terlihat seru
    const extraSpins = (Math.floor(Math.random() * 3) + 5) * Math.PI * 2;
    
    // Hitung total rotasi target dari posisi rotasi Z roda saat ini
    const currentRotation = wheelMesh.rotation.z;
    const targetRotation = currentRotation + extraSpins + (pointerOffset - targetSegmentCenter - (currentRotation % (Math.PI * 2)));

    const startTime = performance.now();

    function animateSpin(currentTime) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Hitung progress menggunakan Easing Out Cubic
      const easedProgress = easeOutCubic(progress);

      // Interpolasi Rotasi Z
      wheelMesh.rotation.z = currentRotation + (targetRotation - currentRotation) * easedProgress;

      // Efek Wobble Sedikit pada Jarum Penunjuk (Pointer) saat Roda Berputar
      if (pointerMesh) {
        if (progress < 0.95) {
          pointerMesh.rotation.x = (Math.random() - 0.5) * 0.15;
        } else {
          pointerMesh.rotation.x = 0; // Kembalikan ke posisi normal saat berhenti
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Animasi Selesai
        wheelMesh.rotation.z = targetRotation; // Lock posisi presisi
        if (pointerMesh) pointerMesh.rotation.x = 0;
        
        resolve(winnerObject);
      }
    }

    requestAnimationFrame(animateSpin);
  });
}
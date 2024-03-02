import QRReader from './vendor/qrscan.js';
import snackbar from './snackbar.js';

import '../css/styles.css';

/* If service worker is installed, show offline usage notification
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        // console.log('SW registered: ', reg);
        if (!localStorage.getItem('offline')) {
          localStorage.setItem('offline', true);
          snackbar.show('App is ready for offline usage.', 5000);
        }
      })
      .catch((regError) => {
        console.log('SW registration failed: ', regError);
      });
  });
}
*/

window.addEventListener('DOMContentLoaded', () => {
  //To check the device and add iOS support
  window.iOS = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
  window.isMediaStreamAPISupported = navigator && navigator.mediaDevices && 'enumerateDevices' in navigator.mediaDevices;
  window.noCameraPermission = false;

  var frame = null;
  var dialogSedekah = false;
  var scanningEle = document.querySelector('.custom-scanner');
  var appScanningEle = document.querySelector('.app__scanner-img');

  var infoUser = document.querySelector('.app__infouser');
  var infoDialogElement = document.querySelector('.app__infodialog');
  var infoDialogCloseBtnElement = document.querySelector('.app__infodialog-close');
  var infoDialogOverlayElement = document.querySelector('.app__infodialog-overlay');

  var dialogResultElement = document.querySelector('.app__dialog_result');
  var dialogResultOverlayElement = document.querySelector('.app__dialog_result-overlay');
  var dialogScanResult = document.querySelector('#scanresult');
  var dialogResultCloseBtnElement = document.querySelector('.app__dialog_result-close');
  dialogResultCloseBtnElement.addEventListener('click', closeDialogResult, false);

  var dialogSedekahElement = document.querySelector('.app__dialog_sedekah');
  var dialogSedekahOverlayElement = document.querySelector('.app__dialog_sedekah-overlay');
  var dialogSedekahYesBtnElement = document.querySelector('.app__dialog_sedekah-yes');
  var dialogSedekahCloseBtnElement = document.querySelector('.app__dialog_sedekah-close');
  dialogSedekahYesBtnElement.addEventListener('click', yesDialogSedekah, false);
  dialogSedekahCloseBtnElement.addEventListener('click', closeDialogSedekah, false);

  var dialogThanksElement = document.querySelector('.app__dialog_thanks');
  var dialogThanksOverlayElement = document.querySelector('.app__dialog_thanks-overlay');
  var dialogThanksCloseBtnElement = document.querySelector('.app__dialog_thanks-close');
  dialogThanksCloseBtnElement.addEventListener('click', closeDialogThanks, false);

  var userName = document.querySelector('#username');
  var userPoin = document.querySelector('#userpoin');

  window.appOverlay = document.querySelector('.app__overlay');

  window.addEventListener('load', (event) => {
    QRReader.init();
    setTimeout(() => {
      setCameraOverlay();
      if (window.isMediaStreamAPISupported) {
        scan();
      }
    }, 1000);
  });

  function setCameraOverlay() {
    window.appOverlay.style.borderStyle = 'solid';
  }

  infoDialogCloseBtnElement.addEventListener('click', closeInfoDialog, false);
  infoUser.addEventListener('click', showInfo, false);

  const loader = document.querySelector("#loading");

  function displayLoading() {
      loader.classList.add("display");
      setTimeout(() => {
          loader.classList.remove("display");
      }, 10000);
  }

  function hideLoading() {
      loader.classList.remove("display");
  }

  //Scan
  function scan(forSelectedPhotos = false) {
    if (window.isMediaStreamAPISupported && !window.noCameraPermission) {
      scanningEle.style.display = 'block';
      appScanningEle.style.display = 'block';
    }

    if (forSelectedPhotos) {
      scanningEle.style.display = 'block';
      appScanningEle.style.display = 'block';
    }

    QRReader.scan((result) => {
      scanningEle.style.display = 'none';
      appScanningEle.style.display = 'none';

      displayLoading();
      var apiUrl = 'https://daftar.terasdakwah.com/apis/v1/attendance/fill';
      var data = {
        token_id: token_id,
        qr_data: result
      };

      var requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };
      
      fetch(apiUrl, requestOptions)
        .then(response => {
          hideLoading();
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          dialogScanResult.innerHTML = data.status;
          showDialogResult();
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }, forSelectedPhotos);

    displayLoading();
    var apiUrl = 'https://daftar.terasdakwah.com/apis/v1/user/data';
    var data = {
      token_id: token_id
    };

    var requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    
    fetch(apiUrl, requestOptions)
      .then(response => {
        hideLoading();
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        userName.innerHTML = data.data.name;
        userPoin.innerHTML = data.data.poin;
        dialogSedekah = data.data.sedekah;
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function showInfo() {
    infoDialogElement.classList.remove('app__infodialog--hide');
    infoDialogOverlayElement.classList.remove('app__infodialog--hide');
  }

  function closeInfoDialog() {
    infoDialogElement.classList.add('app__infodialog--hide');
    infoDialogOverlayElement.classList.add('app__infodialog--hide');
  }

  function showDialogResult() {
    dialogResultElement.classList.remove('app__dialog_result--hide');
    dialogResultOverlayElement.classList.remove('app__dialog_result--hide');
  }

  function closeDialogResult() {
    dialogResultElement.classList.add('app__dialog_result--hide');
    dialogResultOverlayElement.classList.add('app__dialog_result--hide');
  
    if (!dialogSedekah){
      showDialogSedekah();
    }else{
      if (!window.isMediaStreamAPISupported) {
        frame.src = '';
        frame.className = '';
      }
      scan();
    }
  }

  function showDialogSedekah() {
    dialogSedekahElement.classList.remove('app__dialog_sedekah--hide');
    dialogSedekahOverlayElement.classList.remove('app__dialog_sedekah--hide');
  }

  function yesDialogSedekah(){
    displayLoading();
    var apiUrl = 'https://daftar.terasdakwah.com/apis/v1/user/sedekah';
    var data = {
      token_id: token_id,
      sedekah: true
    };
  
    var requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

    fetch(apiUrl, requestOptions)
      .then(response => {
        hideLoading();
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        closeDialogSedekah();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function closeDialogSedekah() {
    dialogSedekahElement.classList.add('app__dialog_sedekah--hide');
    dialogSedekahOverlayElement.classList.add('app__dialog_sedekah--hide');
    showDialogThanks();
  }

  function showDialogThanks() {
    dialogThanksElement.classList.remove('app__dialog_thanks--hide');
    dialogThanksOverlayElement.classList.remove('app__dialog_thanks--hide');
  }

  function closeDialogThanks() {
    dialogThanksElement.classList.add('app__dialog_thanks--hide');
    dialogThanksOverlayElement.classList.add('app__dialog_thanks--hide');

    if (!window.isMediaStreamAPISupported) {
      frame.src = '';
      frame.className = '';
    }
    scan();
  }
});

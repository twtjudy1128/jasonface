const startVideo = async video => {
    try {
      const constraints = { audio: false, video: {} };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
    } catch (error) {
      console.error(error);
    }
  };
  const loadModels = async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(`/js/lib/models`),
      faceapi.nets.faceExpressionNet.loadFromUri(`/js/lib/models`)
    ]);
  };
  
  const createImageElm = path => {
    const image = new Image();
    image.src = path;
    return image;
  };
  
  const createExpressionImageMap = () => {
    const map = new Map();
    // TODO: add Image
    map.set("neutral", createImageElm(`/images/jason_neutral.png`));
    map.set("happy", createImageElm(`/images/jason_happy.png`));
    map.set("sad", createImageElm(`/images/jason_neutral.png`));
    map.set("angry", createImageElm(`/images/jason_angry.png`));
    map.set("fearful", createImageElm(`/images/jason_neutral.png`));
    map.set(
      "disgusted",
      createImageElm(`/images/jason_neutral.png`)
    );
    map.set(
      "surprised",
      createImageElm(`/images/jason_neutral.png`)
    );
    return map;
  };
  
  (async () => {
    const video = document.querySelector("video");
    const imageMap = createExpressionImageMap();
    await loadModels();
    await startVideo(video);
    video.addEventListener("play", () => {
      const canvas = faceapi.createCanvasFromMedia(video);
      document.body.append(canvas);
      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);
      const tinyFaceDetectorOption = {
        // default 416
        inputSize: 224,
        // default 0.5
        scoreThreshold: 0.5
      };
      setInterval(async () => {
        const results = await faceapi
          .detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions(tinyFaceDetectorOption)
          )
          .withFaceExpressions();
        if (results.length <= 0) return;
        const resizedResults = faceapi.resizeResults(results, displaySize);
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        resizedResults.forEach(result => {
          const expression = result.expressions.asSortedArray()[0].expression;
          const image = imageMap.get(expression);
  
          const detection = result.detection;
          const marginVal = 0.4;
          const width = detection.box.width;
          const height = detection.box.height * (1.0 + marginVal);
          const x = detection.box.x;
          const y = detection.box.y - detection.box.height * marginVal;
  
          canvas.getContext("2d").drawImage(image, x, y, width, height);
        });
      }, 100);
    });
  })();


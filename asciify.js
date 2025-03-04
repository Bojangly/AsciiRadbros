import Jimp from "jimp";
import Couleurs from "couleurs";
import terminalCharWidth from "terminal-char-width";
import windowSize from "window-size";

// Set of basic characters ordered by increasing "darkness"
// Used as pixels in the ASCII image
var chars = "adr",
  num_c = chars.length - 1;

export default function asciify(path, options) {
  return new Promise(function (resolve, reject) {
    asciify_core(path, options, function (err, asciified) {
      if (err) {
        reject(err);
      } else {
        resolve(asciified);
      }
    });
  });
}

/**
 * The module's core functionality.
 *
 * @param  [string]   path      - The full path to the image to be asciified
 * @param  [Object]   opts      - The options object
 * @param  [Function] callback  - Callback function
 *
 * @returns [void]
 */
var asciify_core = function (path, opts, callback) {
  // First open image to get initial properties
  // console.log('pre jimp')
  // console.log(path)
  try {
  Jimp.read(path, function (err, image) {
    if (err) return callback("Error loading image: " + err);

    // Percentage based widths
    if (opts.width && opts.width.toString().substr(-1) === "%") {
      opts.width = Math.floor(
        (parseInt(opts.width.slice(0, -1)) / 100) *
          (windowSize.width * terminalCharWidth)
      );
    }

    // Percentage based heights
    if (opts.height && opts.height.toString().substr(-1) === "%") {
      opts.height = Math.floor(
        (parseInt(opts.height.slice(0, -1)) / 100) * windowSize.height
      );
    }

    // Setup options
    var options = {
      fit: opts.fit ? opts.fit : "original",
      width: opts.width ? parseInt(opts.width) : image.bitmap.width,
      height: opts.height ? parseInt(opts.height) : image.bitmap.height,
      c_ratio: opts.c_ratio ? parseInt(opts.c_ratio) : 2,

      color: opts.color == false ? false : true,
      as_string: opts.format === "array" ? false : true,
    };

    var new_dims = calculate_dims(image, options);

    // Resize to requested dimensions
    image.resize(new_dims[0], new_dims[1]);

    var ascii = "";
    var clrs = [];
    if (!options.as_string) ascii = [];

    // Normalization for the returned intensity so that it maps to a char
    // var norm = (255 * 4) / num_c;
    let nextIndex = 0
    // Get and convert pixels
    var i, j, c;
    for (j = 0; j < image.bitmap.height; j++) {
      // height

      // Add new array if type
      if (!options.as_string) ascii.push([]);

      for (i = 0; i < image.bitmap.width; i++) {
        // width
        for (c = 0; c < options.c_ratio; c++) {
          // character ratio

          // var next = chars.charAt(Math.round(intensity(image, i, j) / norm));
          var next = chars.charAt(nextIndex % chars.length);
          nextIndex++
          // console.log(next)
          // console.log(nextIndex)

          // Color character using
          if (options.color) {
            const isInRange = (a, b, range) => Math.abs(a - b) < range;

            var clr = Jimp.intToRGBA(image.getPixelColor(i, j));
            const foundColor = clrs.find(
              (c) =>
                isInRange(c.r, clr.r, 5) &&
                isInRange(c.g, clr.g, 5) &&
                isInRange(c.b, clr.b, 5)
            );
            if (!foundColor) {
              clrs.push(clr);
              next = clrs.indexOf(clr).toString() + next;
            } else {
              next = clrs.indexOf(foundColor).toString() + next;
            }
          }

          if (options.as_string) ascii += next;
          else ascii[j].push(next);
        }
      }

      if (options.as_string && j != image.bitmap.height - 1) ascii += "\n";
    }

    callback(null, [ascii, clrs]);
  });
  } 
  catch (e){
   console.log(e)
}
};

/**
 * Calculates the new dimensions of the image, given the options.
 *
 * @param [Image]  img  - The image (only width and height props needed)
 * @param [Object] opts - The options object
 *
 * @returns [Array] An array of the format [width, height]
 */
var calculate_dims = function (img, opts) {
  switch (opts.fit) {
    // Scale down by width
    case "width":
      return [opts.width, img.bitmap.height * (opts.width / img.bitmap.width)];

    // Scale down by height
    case "height":
      return [
        img.bitmap.width * (opts.height / img.bitmap.height),
        opts.height,
      ];

    // Scale by width and height (ignore aspect ratio)
    case "none":
      return [opts.width, opts.height];

    // Scale down to fit inside box matching width/height of options
    case "box":
      var w_ratio = img.bitmap.width / opts.width,
        h_ratio = img.bitmap.height / opts.height,
        neww,
        newh;

      if (w_ratio > h_ratio) {
        newh = Math.round(img.bitmap.height / w_ratio);
        neww = opts.width;
      } else {
        neww = Math.round(img.bitmap.width / h_ratio);
        newh = opts.height;
      }
      return [neww, newh];

    // Don't change width/height
    // Also the default in case of bad argument
    case "original":
    default:
      // Let them know, but continue
      if (opts.fit !== "original")
        console.error('Invalid option "fit", assuming "original"');

      return [img.bitmap.width, img.bitmap.height];
  }
};

/**
 * Calculates the "intensity" at a point (x, y) in the image, (0, 0) being the
 *   top left corner of the image. Linear combination of rgb_weights with RGB
 *   values at the specified point.
 *
 * @param [Image] i - The image object
 * @param [int]   x - The x coord
 * @param [int]   y - The y coord
 *
 * @returns [int] An int in [0, 1020] representing the intensity of the pixel
 */
var intensity = function (i, x, y) {
  var color = Jimp.intToRGBA(i.getPixelColor(x, y));
  return color.r + color.g + color.b + color.a;
};

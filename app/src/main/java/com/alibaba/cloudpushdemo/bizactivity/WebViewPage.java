package com.alibaba.cloudpushdemo.bizactivity;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.SystemClock;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.webkit.JsResult;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;

import com.alibaba.cloudpushdemo.R;
import com.alibaba.cloudpushdemo.jsb.JavascriptBridge;
import com.alibaba.sdk.android.push.noonesdk.PushServiceFactory;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.FileProvider;

import static android.content.ContentValues.TAG;

@SuppressLint("JavascriptInterface")
public class WebViewPage extends Activity {
    public static JavascriptBridge jsb;
    private static WebView webView;
    private static WebSettings settings;
    private static Activity context = null;
    private JavaScriptMethods mJsMethods;
    private ValueCallback<Uri> mUploadMessage;

    private ValueCallback<Uri[]> mUploadCallbackAboveL;
    ProgressBar mPbLoading;
    private final static int PHOTO_REQUEST = 100;

    String url = "";//跳转的页面

    @SuppressLint({"SetJavaScriptEnabled", "NewApi"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
//		 添加Activity到堆栈

        super.onCreate(savedInstanceState);


//        checkPermissio/n(Manifest.permission.READ_EXTERNAL_STORAGE,)
        ActivityCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE);
        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, 1001);

        setContentView(R.layout.web_view_page);
        webView = (WebView) findViewById(R.id.webView1);
        mPbLoading = (ProgressBar) findViewById(R.id.pb_loading);
        if (Build.VERSION.SDK_INT >= 19) {
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        } else {
            webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        }

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebContentsDebuggingEnabled(true);
        settings = webView.getSettings();
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setDomStorageEnabled(true);
        settings.setDefaultTextEncodingName("UTF-8");
        settings.setAllowContentAccess(true); // 是否可访问Content Provider的资源，默认值 true
        settings.setAllowFileAccess(true);    // 是否可访问本地文件，默认值 true

        settings.setJavaScriptEnabled(true);
        settings.setAllowFileAccessFromFileURLs(true); //Maybe you don't need this rule
        settings.setAllowUniversalAccessFromFileURLs(true);
        //开启JavaScript支持
        settings.setJavaScriptEnabled(true);
        //settings.setAllowFileAccess(true);
        settings.setSupportMultipleWindows(false);
        // 支持缩放
        settings.setSupportZoom(true);
        // 开启 localStorage

        // settings.setDomStorageEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);

        context = this;

        jsb = new JavascriptBridge(webView);

        // 添加个 方法给js
        jsb.addJavaMethod("getDeviceId", new JavascriptBridge.Function() {

            @Override
            public Object execute(final JSONObject params) {
                System.out.println("params:" + params);

                if (null != PushServiceFactory.getCloudPushService()) {

                    return PushServiceFactory.getCloudPushService().getDeviceId();
                }
                return "";

            }
        });


        mJsMethods = new JavaScriptMethods(WebViewPage.this, this, webView);
        jsb.addJavaMethod("takePhoto", new JavascriptBridge.Function() {
            @Override
            public Object execute(JSONObject params) {
                System.out.println("photo:" + params);
                mJsMethods.takePhoto();
                return "";
            }
        });
        //辅助WebView设置处理关于页面跳转，页面请求等操作
        webView.setWebViewClient(new MyWebViewClient());
        //辅助WebView处理图片上传操作
        webView.setWebChromeClient(new MyChromeWebClient());
        //不跳出当前浏览器
//       webView.setWebViewClient(new WebViewClient(){
//			   @Override
//			   public boolean shouldOverrideUrlLoading(WebView view, String url) {
//					   view.loadUrl(url);
//				   return true;
//			   }
//
//    	   });
//
//
//		 webView.setWebChromeClient(new WebChromeClient(){
//			 @Override
//			 public void onProgressChanged(WebView view, int newProgress) {
//				 // TODO 自动生成的方法存根
//
//				 if(newProgress==100){
//					 mPbLoading.setVisibility(View.GONE);//加载完网页进度条消失
//				 }
//				 else{
//					 mPbLoading.setVisibility(View.VISIBLE);//开始加载网页时显示进度条
//					 mPbLoading.setProgress(newProgress);//设置进度值
//				 }
//
//			 }
//		 });
        // 支持缩放
        initListener();

        webView.loadUrl("file:///android_asset/html/index.html");

//        webView.loadUrl("javascript:callH5('Android ok')");


//        String url = "javascript:doAlert()";
//
//        webView.loadUrl(url);

    }

    //自定义 WebViewClient 辅助WebView设置处理关于页面跳转，页面请求等操作【处理tel协议和视频通讯请求url的拦截转发】
    private class MyWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            // Logger.(url);
            if (!TextUtils.isEmpty(url)) {
                //videoFlag = url.contains("vedio");
            }
            if (url.trim().startsWith("tel")) {//特殊情况tel，调用系统的拨号软件拨号【<a href="tel:1111111111">1111111111</a>】
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setData(Uri.parse(url));
                startActivity(i);
            } else {
                String port = url.substring(url.lastIndexOf(":") + 1, url.lastIndexOf("/"));//尝试要拦截的视频通讯url格式(808端口)：【http://xxxx:808/?roomName】
                if (port.equals("808")) {//特殊情况【若打开的链接是视频通讯地址格式则调用系统浏览器打开】
                    Intent i = new Intent(Intent.ACTION_VIEW);
                    i.setData(Uri.parse(url));
                    startActivity(i);
                } else {//其它非特殊情况全部放行
                    view.loadUrl(url);
                }
            }
            return true;
        }
    }


    private Uri imageUri;

    //自定义 WebChromeClient 辅助WebView处理图片上传操作【<input type=file> 文件上传标签】
    public class MyChromeWebClient extends WebChromeClient {
        // For Android 3.0-
        public void openFileChooser(ValueCallback<Uri> uploadMsg) {
            Log.d(TAG, "openFileChoose(ValueCallback<Uri> uploadMsg)");
            mUploadMessage = uploadMsg;

            takePhoto();
            //  }

        }

        // For Android 3.0+
        public void openFileChooser(ValueCallback uploadMsg, String acceptType) {
            Log.d(TAG, "openFileChoose( ValueCallback uploadMsg, String acceptType )");
            mUploadMessage = uploadMsg;

            takePhoto();
        }

        //For Android 4.1
        public void openFileChooser(ValueCallback<Uri> uploadMsg, String acceptType, String capture) {
            Log.d(TAG, "openFileChoose(ValueCallback<Uri> uploadMsg, String acceptType, String capture)");
            mUploadMessage = uploadMsg;

            takePhoto();
        }

        // For Android 5.0+
        public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
            Log.d(TAG, "onShowFileChooser(ValueCallback<Uri> uploadMsg, String acceptType, String capture)");
            mUploadCallbackAboveL = filePathCallback;

            takePhoto();
            return true;
        }
    }

    /**
     * 拍照
     */
    private void takePhoto() {
        File fileUri = new File(Environment.getExternalStorageDirectory().getPath() + "/" + SystemClock.currentThreadTimeMillis() + ".jpg");
        imageUri = Uri.fromFile(fileUri);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.BASE) {
            imageUri = FileProvider.getUriForFile(WebViewPage.this, getPackageName() + ".fileprovider", fileUri);//通过FileProvider创建一个content类型的Uri
        }
        PhotoUtils.takePicture(WebViewPage.this, imageUri, PHOTO_REQUEST);
    }

    private void initListener() {

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
                return super.onJsAlert(view, url, message, result);
            }

            @Override
            public void onProgressChanged(WebView view, final int newProgress) {
                super.onProgressChanged(view, newProgress);
            }

            @Override
            public void onReceivedTitle(WebView view, String title) {
                super.onReceivedTitle(view, title);
            }

        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return super.shouldInterceptRequest(view, request);
            }


            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                //6.0以下

            }

            //@RequiresApi(api = Build.VERSION_CODES.M)
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
            }


            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
                super.onReceivedHttpError(view, request, errorResponse);
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
            }
        });
    }


    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK && requestCode == JavaScriptMethods.TAKE_PHOTO) {
            Log.d(TAG, "拍到图片");
            //保存照片显示在H5界面
            //获取照片的旋转角度，三星的拍照后旋转了90度
            int bitmapDegree = getBitmapDegree(mJsMethods.filePath);
            Log.d("照片的旋转:", "" + bitmapDegree);
            Uri uri = Uri.fromFile(new File(mJsMethods.filePath));
            try {
                BitmapFactory.Options options = new BitmapFactory.Options();
                options.inPreferredConfig = Bitmap.Config.RGB_565;
                //参数可调，值越大图片大小越小
                options.inSampleSize = 4;
                Bitmap takePhotoBitmap = BitmapFactory.decodeStream(getContentResolver().openInputStream(uri), null, options);
                //纠正旋转角度
                Bitmap rotateBitmapByDegreebitmap = rotateBitmapByDegree(takePhotoBitmap, bitmapDegree);
                //转64并加密，加密是因为给H5 传递json的时候会有回车换行，加密后消除，但是要在H5端做解密操作，
                // 并除去回车换行符，在Android端做也是一样的
                String base64ImgStr = Base64Util.bitmapToBase64(rotateBitmapByDegreebitmap);
                String base64EncodeImgStr = base64ImgStr;//Base64Util.encode(base64ImgStr);
                JSONObject json = new JSONObject();
                json.put("base64EncodeImgStr", base64EncodeImgStr);
                String url = "javascript:from_android_for_base64('" + json.toString() + "')";

                webView.loadUrl(url);


                takePhotoBitmap.recycle();
                rotateBitmapByDegreebitmap.recycle();

            } catch (FileNotFoundException | JSONException e) {
                e.printStackTrace();
            }


        }
    }


    /**
     * 读取图片的旋转的角度
     *
     * @param path 图片绝对路径
     * @return 图片的旋转角度
     */
    private int getBitmapDegree(String path) {
        int degree = 0;
        try {
            // 从指定路径下读取图片，并获取其EXIF信息
            ExifInterface exifInterface = new ExifInterface(path);
            // 获取图片的旋转信息
            int orientation = exifInterface.getAttributeInt(ExifInterface.TAG_ORIENTATION,
                    ExifInterface.ORIENTATION_NORMAL);
            switch (orientation) {
                case ExifInterface.ORIENTATION_ROTATE_90:
                    degree = 90;
                    break;
                case ExifInterface.ORIENTATION_ROTATE_180:
                    degree = 180;
                    break;
                case ExifInterface.ORIENTATION_ROTATE_270:
                    degree = 270;
                    break;
                default:
                    break;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return degree;
    }

    /**
     * 将图片按照某个角度进行旋转
     *
     * @param bm     需要旋转的图片
     * @param degree 旋转角度
     * @return 旋转后的图片
     */
    public Bitmap rotateBitmapByDegree(Bitmap bm, int degree) {
        Bitmap returnBm = null;
        // 根据旋转角度，生成旋转矩阵
        Matrix matrix = new Matrix();
        matrix.postRotate(degree);
        try {
            // 将原始图片按照旋转矩阵进行旋转，并得到新的图片
            returnBm = Bitmap.createBitmap(bm, 0, 0, bm.getWidth(), bm.getHeight(), matrix, true);
        } catch (OutOfMemoryError e) {
            Log.d("内存溢出", "");
        }
        if (returnBm == null) {
            returnBm = bm;
        }
        if (bm != returnBm) {
            bm.recycle();
        }
        return returnBm;
    }

}

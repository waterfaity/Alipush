package com.alibaba.cloudpushdemo.bizactivity;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.alibaba.cloudpushdemo.ProviderUtils;

import java.io.File;
import java.util.Date;

import androidx.core.content.FileProvider;

public class JavaScriptMethods {
    private static final String TAG = "javaS";
    public static String JSINTERFACE = "jsInterface";
    private Activity mActivity;
    private WebView mWebView;
    private Context mContext;
    public static final int TAKE_PHOTO = 1000;

    public JavaScriptMethods(Activity activity, Context context, WebView webView) {
        mActivity = activity;
        mWebView = webView;
        mContext = context;
    }

    public String filePath = Environment.getExternalStorageDirectory() + File.separator + "12" + File.separator + new Date().getTime() + ".jpg";

    @JavascriptInterface
    public void takePhoto() {
//        调用系统摄像头
        Log.d("调用前置摄像头：", "");
        startCamera(TAKE_PHOTO, filePath);
    }


    private void startCamera(int type, String imgName) {
        File filePath = new File(imgName);
        try {
            if (!filePath.exists()) {
                filePath.getParentFile().mkdirs();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        Uri imageUri = null;
        /**
         * android7.0及以上
         */


        Log.i(TAG, "startCamera: " + Build.VERSION.SDK_INT);

        Uri providerUri = ProviderUtils.getProviderUri(mActivity, filePath);
//        if (Build.VERSION.SDK_INT >= 24) {
////            imageUri = FileProvider.getUriForFile(mContext, mActivity.getPackageName() + ".provider", filePath);
////        } else {
//            imageUri = Uri.fromFile(filePath);
//        }
        //启动相机程序
        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        intent.putExtra(MediaStore.EXTRA_OUTPUT, providerUri);
        intent.addCategory(Intent.CATEGORY_DEFAULT);
        mActivity.startActivityForResult(intent, type);
    }
}

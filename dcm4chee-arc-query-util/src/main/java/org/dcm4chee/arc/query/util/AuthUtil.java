package org.dcm4chee.arc.query.util;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import io.jsonwebtoken.Claims;

import static org.dcm4chee.arc.query.util.JavaWebToken.verifyJavaWebToken;

public class AuthUtil {
	
	public static String getUserInfo(HttpServletRequest request) {
		// 验证用户  
    	Cookie[] cookies = request.getCookies();  
    	String userName = null;  
    	if(cookies != null){  
    		for(int i=0; i<cookies.length; i++){  
    			if(cookies[i].getName().equals("token")){  
    				Cookie cookie = cookies[i];  
    				try {  
    					// 检查token  
    					Claims claims = JWTUtil.parseJWT(cookie.getValue());  
    					userName = claims.getSubject();                          
    				} catch (Exception e) {  
    					e.printStackTrace();  
    				}  
    			}  
    		}  
    	}        	
    	return userName; 
	}
	
	private static Map<String, Object> getClientLoginInfo(HttpServletRequest request) throws Exception {
        Map<String, Object> r = new HashMap<>();
        String sessionId = request.getHeader("sessionId");
        if (sessionId != null) {
            r = decodeSession(sessionId);
            return r;
        }
        throw new Exception("session解析错误");
    }

    public static Long getUserId(HttpServletRequest request) throws Exception {
        return  Long.valueOf((Integer)getClientLoginInfo(request).get("userId"));

    }

    /**
     * session解密
     */
    public static Map<String, Object> decodeSession(String sessionId) {
        try {
            return verifyJavaWebToken(sessionId);
        } catch (Exception e) {
            System.err.println("");
            return null;
        }
    }
}

package org.dcm4chee.arc.qido;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.stream.JsonGenerator;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;
import javax.ws.rs.core.UriInfo;

import org.apache.commons.codec.digest.DigestUtils;
import org.dcm4che3.conf.api.DicomConfiguration;
import org.dcm4che3.conf.json.JsonConfiguration;
import org.dcm4che3.net.Device;
import org.dcm4chee.arc.entity.User;
import org.dcm4chee.arc.query.UserService;
import org.dcm4chee.arc.query.util.AuthUtil;
import org.dcm4chee.arc.query.util.JWTUtil;
//import org.dcm4chee.arc.event.SoftwareConfiguration;
import org.jboss.resteasy.annotations.cache.NoCache;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path("/user")
@RequestScoped
public class UserRS {
    private static final Logger LOG = LoggerFactory.getLogger(UserRS.class);

    @Inject
    private DicomConfiguration conf;

    @Inject
    private JsonConfiguration jsonConf;

    @Context
    private UriInfo uriInfo;

    @Context
    private HttpServletRequest request;
    
    @Context
    private HttpServletResponse response;

    @Inject
    private Device device;
    
    @Inject
    private UserService userService;

    @QueryParam("userId")    
    private String userId;
    
    @QueryParam("passWd")    
    private String passWd;
    
    @GET
    @NoCache
    @Path("/login")
    @Produces("application/json")
    public StreamingOutput checkUser() {
        logRequest();
        String password = DigestUtils.sha1Hex(passWd.getBytes());
        try {         
        	User user = new User();
        	user.setUserId(userId);
        	user.setPassWd(password);
        	LOG.info("userId" + userId);        	
        	boolean result = userService.checkUser(user);
        	
            return out -> {
                JsonGenerator gen = Json.createGenerator(out);
                gen.writeStartObject();
                if(result) {
                	
                	Map<String, Object> map = new HashMap<String, Object>();
                	map.put("userId", userId);                	
                	
                	//JsonWriter writer = new JsonWriter(gen);
                    //gen.writeStartObject();
                    gen.write("status", "ok");
                    //writer.writeNotNullOrDef("session", session, null);
                    String token = "";
                    try {
						token = JWTUtil.createJWT("1", userId, 1000*60*10);
						// 将token放进Cookie  
						Cookie cookie = new Cookie("token", token);  
						cookie.setPath("/");  
						// 过期时间设为10min  
						cookie.setMaxAge(60*10);  
						response.addCookie(cookie);  
					} catch (Exception e) {
						e.printStackTrace();
					}  
                }else {                	
                	gen.write("status", "faild");                
                }
                gen.writeEnd();
                gen.flush();
            };
        } catch (Exception e) {
            throw new WebApplicationException(errResponseAsTextPlain(e));
        }
    }

    @GET
    @NoCache
    @Path("/validate")
    @Produces("application/json")
    public StreamingOutput validate() {
        return out -> {
        	String userName = AuthUtil.getUserInfo(request);
        	JsonGenerator gen = Json.createGenerator(out);
        	gen.writeStartObject();
        	if(userName != null) {
        		//request.setAttribute("userName", userName);
        		gen.write("userName", "userName");	
        	}else {
        		gen.write("userName", "");
        	}        	
        	gen.writeEnd();
            gen.flush();
        };        
    }

    private StreamingOutput writeJsonArray(String[] values) {
        return out -> {
                JsonGenerator gen = Json.createGenerator(out);
                gen.writeStartArray();
                for (String value : values)
                    gen.write(value);
                gen.writeEnd();
                gen.flush();
        };
    }
  
    private void logRequest() {
        LOG.info("Process {} {} from {}@{}", request.getMethod(), request.getRequestURI(),
                request.getRemoteUser(), request.getRemoteHost());
    }

    private Response errResponse(Object errorMessage, Response.Status status) {
        Object entity = "{\"errorMessage\":\"" + errorMessage + "\"}";
        return Response.status(status).entity(entity).build();
    }

    private Response errResponseAsTextPlain(Exception e) {
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        String exceptionAsString = sw.toString();
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(exceptionAsString).type("text/plain").build();
    }
}

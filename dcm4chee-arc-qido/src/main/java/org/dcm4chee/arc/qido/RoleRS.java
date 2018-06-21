package org.dcm4chee.arc.qido;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.stream.JsonGenerator;
import javax.servlet.http.HttpServletRequest;
import javax.validation.constraints.Pattern;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;
import javax.ws.rs.core.UriInfo;

import org.dcm4che3.conf.api.ConfigurationException;
import org.dcm4che3.conf.api.DicomConfiguration;
import org.dcm4che3.conf.json.ConfigurationDelegate;
import org.dcm4che3.conf.json.JsonConfiguration;
import org.dcm4che3.net.ApplicationEntityInfo;
import org.dcm4che3.net.Device;
import org.dcm4che3.net.DeviceInfo;
import org.dcm4chee.arc.conf.ArchiveDeviceExtension;
//import org.dcm4chee.arc.event.SoftwareConfiguration;
import org.jboss.resteasy.annotations.cache.NoCache;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path("/temp/config")
@RequestScoped
public class RoleRS {
    private static final Logger LOG = LoggerFactory.getLogger(RoleRS.class);

    @Inject
    private DicomConfiguration conf;

    @Inject
    private JsonConfiguration jsonConf;

    @Context
    private UriInfo uriInfo;

    @Context
    private HttpServletRequest request;

//    @Inject
//    private Event<SoftwareConfiguration> softwareConfigurationEvent;

    @Inject
    private Device device;

    @QueryParam("options")
    @Pattern(regexp = "true|false")
    private String register;

    private ConfigurationDelegate configDelegate = new ConfigurationDelegate() {
        @Override
        public Device findDevice(String name) throws ConfigurationException {
            return conf.findDevice(name);
        }
    };
    

    @GET
    @NoCache
    @Path("/aes")
    @Produces("application/json")
    public StreamingOutput listAETs() {
        logRequest();
        try {
            final ApplicationEntityInfo[] aeInfos =
                    conf.listAETInfos(new ApplicationEntityInfoBuilder(uriInfo).aetInfo);
            Arrays.sort(aeInfos, Comparator.comparing(ApplicationEntityInfo::getAETitle));
            return out -> {
                JsonGenerator gen = Json.createGenerator(out);
                gen.writeStartArray();
                for (ApplicationEntityInfo aeInfo : aeInfos)
                    jsonConf.writeTo(aeInfo, gen);
                gen.writeEnd();
                gen.flush();
            };
        } catch (Exception e) {
            throw new WebApplicationException(errResponseAsTextPlain(e));
        }
    }

    

    @GET
    @NoCache
    @Path("/unique/aets")
    @Produces("application/json")
    public StreamingOutput listRegisteredAETS() {
        logRequest();
        try {
            return writeJsonArray(conf.listRegisteredAETitles());
        } catch (Exception e) {
            throw new WebApplicationException(errResponseAsTextPlain(e));
        }
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

    private EnumSet<DicomConfiguration.Option> options() {
        ArchiveDeviceExtension arcDev = device.getDeviceExtension(ArchiveDeviceExtension.class);
        EnumSet<DicomConfiguration.Option> options = EnumSet.of(
                DicomConfiguration.Option.PRESERVE_VENDOR_DATA,
                DicomConfiguration.Option.PRESERVE_CERTIFICATE,
                arcDev.isAuditSoftwareConfigurationVerbose()
                    ? DicomConfiguration.Option.CONFIGURATION_CHANGES_VERBOSE : DicomConfiguration.Option.CONFIGURATION_CHANGES);
        if (register == null || Boolean.parseBoolean(register))
            options.add(DicomConfiguration.Option.REGISTER);
        return options;
    }

   

    @POST
    @Path("/unique/aets/{aet}")
    @Consumes("application/json")
    public void registerAET(@PathParam("aet") String aet) {
        logRequest();
        try {
            if (!conf.registerAETitle(aet))
                throw new WebApplicationException(errResponse(
                        "Application Entity Title " + aet + " already registered.", Response.Status.CONFLICT));
        } catch (ConfigurationException e) {
            throw new WebApplicationException(errResponseAsTextPlain(e));
        }
    }

    @DELETE
    @Path("/unique/aets/{aet}")
    public void unregisterAET(@PathParam("aet") String aet) {
        logRequest();
        try {
            List<String> aets = Arrays.asList(conf.listRegisteredAETitles());
            if (!aets.contains(aet))
                throw new WebApplicationException(errResponse(
                        "Application Entity Title " + aet + " not registered.", Response.Status.NOT_FOUND));
            conf.unregisterAETitle(aet);
        } catch (ConfigurationException e) {
            throw new WebApplicationException(errResponseAsTextPlain(e));
        }
    }

    

    

    private static class DeviceInfoBuilder {
        final DeviceInfo deviceInfo = new DeviceInfo();

        DeviceInfoBuilder(UriInfo info) {
            MultivaluedMap<String, String> map = info.getQueryParameters();
            for (Map.Entry<String, List<String>> entry : map.entrySet()) {
                switch(entry.getKey()) {
                    case "dicomDeviceName":
                        deviceInfo.setDeviceName(toString(entry));
                        break;
                    case "dicomDescription":
                        deviceInfo.setDescription(toString(entry));
                        break;
                    case "dicomManufacturer":
                        deviceInfo.setManufacturer(toString(entry));
                        break;
                    case "dicomManufacturerModelName":
                        deviceInfo.setManufacturerModelName(toString(entry));
                        break;
                    case "dicomSoftwareVersion":
                        deviceInfo.setSoftwareVersions(toStrings(entry));
                        break;
                    case "dicomStationName":
                        deviceInfo.setStationName(toString(entry));
                        break;
                    case "dicomInstitutionName":
                        deviceInfo.setInstitutionNames(toStrings(entry));
                        break;
                    case "dicomInstitutionDepartmentName":
                        deviceInfo.setInstitutionalDepartmentNames(toStrings(entry));
                        break;
                    case "dicomPrimaryDeviceType":
                        deviceInfo.setPrimaryDeviceTypes(toStrings(entry));
                        break;
                    case "dicomInstalled":
                        deviceInfo.setInstalled(Boolean.parseBoolean(toString(entry)));
                        break;
                    case "hasArcDevExt":
                        deviceInfo.setArcDevExt(Boolean.parseBoolean(toString(entry)));
                        break;
                }
            }
        }

        static String[] toStrings(Map.Entry<String, List<String>> entry) {
            return entry.getValue().toArray(new String[entry.getValue().size()]);
        }

        static String toString(Map.Entry<String, List<String>> entry) {
            return entry.getValue().get(0);
        }
    }


    private static class ApplicationEntityInfoBuilder {
        final ApplicationEntityInfo aetInfo = new ApplicationEntityInfo();

        ApplicationEntityInfoBuilder(UriInfo info) {
            MultivaluedMap<String, String> map = info.getQueryParameters();
            for (Map.Entry<String, List<String>> entry : map.entrySet()) {
                switch(entry.getKey()) {
                    case "dicomDeviceName":
                        aetInfo.setDeviceName(toString(entry));
                        break;
                    case "dicomAETitle":
                        aetInfo.setAETitle(toString(entry));
                        break;
                    case "dicomAssociationInitiator":
                        aetInfo.setAssociationInitiator(Boolean.parseBoolean(toString(entry)));
                        break;
                    case "dicomAssociationAcceptor":
                        aetInfo.setAssociationAcceptor(Boolean.parseBoolean(toString(entry)));
                        break;
                    case "dicomDescription":
                        aetInfo.setDescription(toString(entry));
                        break;
                    case "dicomApplicationCluster":
                        aetInfo.setApplicationCluster(toStrings(entry));
                        break;
                }
            }
        }

        static String[] toStrings(Map.Entry<String, List<String>> entry) {
            return entry.getValue().toArray(new String[entry.getValue().size()]);
        }

        static String toString(Map.Entry<String, List<String>> entry) {
            return entry.getValue().get(0);
        }
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

import { LightningElement, track, api } from "lwc";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import FullCalendarJS from "@salesforce/resourceUrl/FullCalenderJS";
import { NavigationMixin } from "lightning/navigation";
import getTimeSlotsFromCerner from "@salesforce/apex/ShowAppointmentController.getTimeSlotsFromCerner";
import getSlotDetailsOfSalesforce from "@salesforce/apex/ShowAppointmentController.getSlotDetailsOfSalesforce";
import getPatientName from "@salesforce/apex/ShowAppointmentController.getPatientName";
import getAppointmentOfPatient from "@salesforce/apex/ShowAppointmentController.getAppointmentOfPatient";
import APPOINTMENT_REASON from "@salesforce/schema/Appointment__c.Appointment_Reason__c";
import EHR_ENCOUNTER from "@salesforce/schema/Appointment__c.EHR_Encounter__c";
import STATUS from "@salesforce/schema/Appointment__c.Status__c";
import ATTENDING_DOCTOR from "@salesforce/schema/Appointment__c.Attending_Doctor__c";
import ENTERED_BY_PERSON from "@salesforce/schema/Appointment__c.Entered_by_Person__c";
import NEW_ATTENDING_DOCTOR from "@salesforce/schema/Appointment__c.New_Attending_Doctor__c";
import NEW_REFERRING_PROVIDER from "@salesforce/schema/Appointment__c.New_Referring_Provider__c";
import ENCOUNTER_ID from "@salesforce/schema/Appointment__c.Encounter_ID__c";
import ASSIGNED_PATIENT_LOCATION from "@salesforce/schema/Appointment__c.Assigned_Patient_Location__c";
import CONSULTING_PROVIDER from "@salesforce/schema/Appointment__c.Consulting_Provider_text__c";
import APPOINTMENT_END_TIME from "@salesforce/schema/Appointment__c.Appointment_End_Time__c";
import APPOINTMENT_START_TIME from "@salesforce/schema/Appointment__c.Appointment_Start_Time__c";
export default class FullCalendarJs extends NavigationMixin(LightningElement) {
  @api patientId = '001040000132ggNAAQ';
  patientName;
  fullCalendarJsInitialised = false;
  allEvents = [];
  selectedEvent;
  createRecord = false;
  isLoading = true;
  startDate;
  endDate;
  appointmentStartTime;
  appointmentEndTime;
  appointmentId='';
  appointmentName='';
  selectedSlotDetails = {};
  appointmentFields = [
    ASSIGNED_PATIENT_LOCATION,
    EHR_ENCOUNTER,
    APPOINTMENT_REASON,
    ENCOUNTER_ID,
    NEW_REFERRING_PROVIDER,
    ATTENDING_DOCTOR,
    NEW_ATTENDING_DOCTOR,
    ENTERED_BY_PERSON,
    STATUS,
    CONSULTING_PROVIDER,
  ];
  mapOfDivIdsAndListOfAppTypes = {
    leftParentDivGroup3: [
      {
        tempApptId: "a3A040000003ivcEAA",
        appointmentTypeId: "a3204000000I1edAAC",
        orderId: "a3504000000ZZYZAA4",
        orderLocationId: "1116755837",
      },
    ],
    leftParentDivGroup2: [
      {
        tempApptId: "a3A040000003izPEAQ",
        appointmentTypeId: "a3204000000I1eeAAC",
        orderId: "a3504000000ZZYKAA4",
        orderLocationId: "486938595",
      },
    ],
    leftParentDivGroup1: [
      {
        tempApptId: "a3A040000003izUEAQ",
        appointmentTypeId: "a3204000000I1elAAC",
        orderId: "a3504000000ZZYQAA4",
        orderLocationId: "624869819",
      },
    ],
  };
  orderIds = ["a3504000000ZZYZAA4", "a3504000000ZZYKAA4", "a3504000000ZZYQAA4"];
  locationIds = [
    "131040000005TLIAA2",
    "131040000005TMLAA2",
    "131040000005TF3AAM",
  ];
  constructor() {
    super();
    console.log("patientId====>" + this.patientId);
  }
  connectedCallback() {
    console.log("connected call back");
    console.log("patientId====>" + this.patientId);
    //this.loadAllJs();
  }
  renderedCallback() {
    console.log("Rendered call back");
    // Performs this operation only on first render
    if (this.fullCalendarJsInitialised) {
      console.log('inside if');
      return;
    }else{
      console.log('Inside Else');
      this.loadAllJs();
    }
  }
  loadAllJs() {
    console.log('LINE 100');
    Promise.all([
      loadScript(this, FullCalendarJS + "/jquery.min.js"),
      loadScript(this, FullCalendarJS + "/moment.min.js"),
      loadScript(this, FullCalendarJS + "/theme.js"),
      loadScript(this, FullCalendarJS + "/fullcalendar.min.js"),
      loadStyle(this, FullCalendarJS + "/fullcalendar.min.css")
    ])
      .then(() => {
        this.fullCalendarJsInitialised = true;
        console.log('js files loaded successfully');
        // Initialise the calendar configuration
        this.getSlots();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log('Error while loading js files');
        console.error({
          message: "Error occured on FullCalendarJS",
          error,
        });
        this.renderedCallback();
      });
  }

  initialiseFullCalendarJs() {
    const ele = this.template.querySelector("div.fullcalendarjs");
    // eslint-disable-next-line no-undef
    //TODO: to be moved outside this function
    function openActivityForm(startDate, endDate) {
      self.startDate = startDate;
      self.endDate = endDate;
    }

    $(ele).fullCalendar({
      //timeZone: 'UTC',
      viewRender: function(view,element){
        console.log('view===>'+view.name);
        console.log('element===>'+JSON.stringify(element));
        //element.css("background", "lightgrey");
        element.css("cursor", "not-allowed");
        element.css("font-weight", "bold");
        //element.css("text-transform", "uppercase"); 
        //$("#calendar").addClass('agenda');//this change background color to orange for all views
      },

      header: {
        left: "month,agendaWeek,agendaDay,listWeek",
        center: "prev title next ",
        right: "today prevYear nextYear",
      },
      buttonText: {
        today: "Today",
        prevYear: "Prev Year",
        nextYear: "Next Year",
        month: "Month",
        agendaWeek: "Week",
        agendaDay: "Day",
        listWeek: "List",
      },
      nowIndicator: true,
      now: new Date(),
      defaultView: "agendaWeek",
      themeSystem: "standard",
      defaultDate: new Date(),
      navLinks: true,
      editable: true,
      eventLimit: true,
      events: this.allEvents,
      allDaySlot: false,
      //dragScroll : true,
      //droppable: true,
      //weekNumbers : true,
      //eventDrop: this.eventDropHandler.bind(this),
      eventClick: this.eventClickHandler.bind(this),
      //dayClick : this.dayClickHandler.bind(this),
      eventMouseover: this.eventMouseoverHandler.bind(this),
    });
    this.isLoading = false;
  }

  eventMouseoverHandler = (event, jsEvent, view) => {};
  eventDropHandler = (event, delta, revertFunc) => {
    alert(event.title + " was dropped on " + event.start.format());
    if (!confirm("Are you sure about this change? ")) {
      revertFunc();
    }
  };

  eventClickHandler = (event, jsEvent, view) => {
    this.isLoading = true;
    if (this.patientId && !event.extendedProps.appointmentId) {
      getPatientName({
        patientId: this.patientId,
      })
        .then((result) => {
          this.patientName = result;
          console.log("result===>" + result);
          if (event.title) {
            this.selectedSlotDetails["serviceTypeName"] = event.title;
          }
          if (event.start) {
            this.selectedSlotDetails["start"] = event.start;
          }
          if (event.end) {
            this.selectedSlotDetails["end"] = event.end;
          }
          if (event.id) {
            this.selectedSlotDetails["slotId"] = event.id;
          }
          if (event.extendedProps.resourceTypeName) {
            this.selectedSlotDetails["resourceTypeName"] =
              event.extendedProps.resourceTypeName;
          }
          if (event.extendedProps.startDate) {
            console.log('Time==>'+event.extendedProps.startDate);
            var startDate = event.extendedProps.startDate.toISOString();
            this.selectedSlotDetails["startDate"] = startDate;
            this.appointmentStartTime = startDate;
          }
          if (event.extendedProps.endDate) {
            var endDate = event.extendedProps.endDate.toISOString();
            this.selectedSlotDetails["endDate"] = endDate;
            this.appointmentEndTime = endDate; //2022-02-03T06:00:00Z
          }
          if (event.extendedProps.locationName) {
            this.selectedSlotDetails["locationName"] =
              event.extendedProps.locationName;
          }
          if (event.extendedProps.status) {
            this.selectedSlotDetails["status"] = event.extendedProps.status;
          }
          if (event.extendedProps.locationId) {
            this.selectedSlotDetails["locationId"] =
              event.extendedProps.locationId;
          }
          if (event.extendedProps.duration) {
            this.selectedSlotDetails["duration"] = event.extendedProps.duration;
          }
          if (event.extendedProps.schedule) {
            this.selectedSlotDetails["schedule"] = event.extendedProps.schedule;
          }
          console.log(
            "eventClickHandler called " +
              JSON.stringify(this.selectedSlotDetails)
          );
          this.isLoading = false;
          this.selectedEvent = event;
        })
        .catch((error) => {
          this.isLoading = false;
          console.log("eror===>" + error);
        });
    }else if(event.extendedProps.appointmentId){
      this.appointmentId = event.extendedProps.appointmentId;
      this.selectedEvent = undefined;
      this.appointmentName = event.extendedProps.appointmentName;
      this.isLoading = false;
    } else {
      this.isLoading = false;
      let msg = "Patient is not available please try again.";
      this.showToast("Error", msg, "error");
    }
  };

  dayClickHandler = (date, jsEvent, view) => {
    jsEvent.preventDefault();
    this.createRecord = true;
  };

  createCancel() {
    this.createRecord = false;
  }

  closeModal() {
    this.selectedEvent = undefined;
    this.selectedSlotDetails = {};
  }
  setAppointmentStartTime(event){
    this.appointmentStartTime = event.target.value;
  }
  setAppointmentEndTime(event){
    this.appointmentEndTime = event.target.value;
  }
  onSave(event) {
    console.log("Onsave");
    event.preventDefault();
    //console.log("on Save===>" + JSON.stringify(event.detail.fields));
    var fields = event.detail.fields;
    console.log("patientId===>" + this.patientId);
    console.log(
      "selectedSlotDetails====>" + JSON.stringify(this.selectedSlotDetails)
    );

    getSlotDetailsOfSalesforce({
      selectedSlotDetails: JSON.stringify(this.selectedSlotDetails),
    }).then((response) => {
        console.log("response====>" + JSON.stringify(response));
        if (response == null || response == "") {
          let msg = "Something went wrong, talk to your adminstrator";
          this.showToast("Error", msg, "error");
          return;
        } else {
          if(!this.appointmentStartTime){
            let msg = 'Please fill up the appointment start time.'
            this.showToast("Error", msg, "error");
            return;
          }else{
            fields["Appointment_Start_Time__c"] = this.appointmentStartTime;
          }
          if(!this.appointmentEndTime){
            let msg = 'Please fill up the appointment end time.'
            this.showToast("Error", msg, "error");
            return;
          }else{
            fields["Appointment_End_Time__c"] = this.appointmentEndTime;
          }
          console.log('this.appointmentStartTime===>'+Date.parse(this.appointmentStartTime));
          console.log('this.selectedSlotDetails.start===>'+this.selectedSlotDetails.start);
          if(Date.parse(this.appointmentStartTime) < this.selectedSlotDetails.start || Date.parse(this.appointmentStartTime) >= this.selectedSlotDetails.end){
            //let msg = 'Start date time should not be greater or equal to slot end date time or should not less than slot start time.'
            let msg = 'Please select the appropriate start date time';
            this.showToast("Error", msg, "error");
            return;
          }
          if(Date.parse(this.appointmentEndTime) > this.selectedSlotDetails.end || Date.parse(this.appointmentEndTime) <= this.selectedSlotDetails.start){
            //let msg = 'End date time should not be greater or equal slot end time or should not be less or e slot start time.'
            let msg = 'Please select the appropriate end date time';
            this.showToast("Error", msg, "error");
            return;
          }
          if (this.patientId) fields["Patient__c"] = this.patientId;
          if (response.locationId) fields["Location__c"] = response.locationId;
          if (response.appointmentTypeId) fields["Appointment_Type_Code_Set__c"] = response.appointmentTypeId;
          if (fields.Patient__c != null && fields.Location__c != null ) {
            //Submiting the form
            this.template.querySelector("lightning-record-form").submit(fields);
            let msg = "Your appointment is created succesfully!";
            this.showToast("Success", msg, "success");
            //Closing the popup
            this.selectedEvent = "";
            
          } else {
            console.log("Else 260");
            let msg = "Patient is not available please try again.";
            this.showToast("Error", msg, "error");
          }
        }
      })
      .catch((error) => {
        console.log("Error===>" + JSON.stringify(error));
      });
  }
  onSuccess(event) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userLocale = navigator.language;
    //console.log('Before change===>'+event.detail.fields.Appointment_Start_Time__c.value);
    var startTime = new Date(event.detail.fields.Appointment_Start_Time__c.value.toLocaleString(userLocale, {timeZone: timezone}));
    //console.log('After change===>'+startTime);
    var endTime = new Date(event.detail.fields.Appointment_End_Time__c.value.toLocaleString(userLocale, {timeZone: timezone}));;
    var newApp = {
      id: event.detail.id,
      title: event.detail.fields.Name.value,
      start: startTime,
      end: endTime,
      extendedProps: {
        appointmentId: event.detail.id,
        appointmentName: event.detail.fields.Name.value
      },
      editable: false,
      backgroundColor: "#0176d3",
      borderColor: "white",
      color: "white"
    };
    console.log(newApp);
    this.allEvents.push(newApp);
    const ele = this.template.querySelector("div.fullcalendarjs");
    $(ele).fullCalendar( 'renderEvent', newApp, true );
    this.selectedSlotDetails = {};
    //console.log("on success==>" + JSON.stringify(event.detail.fields));
  }
  onError(event) {
    console.log("on Error " + JSON.stringify(event.detail));
  }

  showToast(title, msg, variant) {
    const evt = new ShowToastEvent({
      title: title,
      message: msg,
      variant: variant,
    });
    this.dispatchEvent(evt);
  }

  getSlots() {
    getTimeSlotsFromCerner({
      orderIds: this.orderIds,
      locationIds: this.locationIds,
      timeSlotId: "1234567890",
      mapDivIdsAndGroupedApptTypes: JSON.stringify(
        this.mapOfDivIdsAndListOfAppTypes
      ),
    })
      .then((result) => {
        //console.log(JSON.stringify(result));
        var arrayToStoreTimeSlots = [];
        for (var key in result) {
          arrayToStoreTimeSlots.push(result[key]); // Pushing slots in array
        }
        var temp = arrayToStoreTimeSlots.map((item) => {
          item.map((slot) => {
            const userLocale = navigator.language;
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            console.log('timezone===>'+timezone);
            console.log('const userLocale ===>'+userLocale);
            slot.startDate = new Date(slot.startDate.toLocaleString(userLocale, {timeZone: timezone}));
            slot.endDate = new Date(slot.endDate.toLocaleString(userLocale, {timeZone: timezone}));;
            var obj = {
              id: slot.slotId,
              title: slot.serviceTypeName,
              start: slot.startDate,
              end: slot.endDate,
              editable: false,
              extendedProps: {
                resourceTypeName: slot.resourceTypeName,
                status: slot.free,
                locationName: slot.locationName,
                locationId: slot.locationId,
                duration: slot.duration,
                schedule: slot.schedule,
                startDate: slot.startDate,
                endDate: slot.endDate,
              },
              //allDay : false,
              backgroundColor: "#016A51",
              borderColor: "white",
              color: "white",
              //backgroundColor: "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")",
              //borderColor: "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")"
            };
            this.allEvents.push(obj);
          });
        });
        this.getAppointmentDetails();
      })
      .catch((error) => {
        console.log("Error===>" + JSON.stringify(error));
      });
  }
  getAppointmentDetails(){
    console.log('Patient ID==>'+this.patientId);
    getAppointmentOfPatient({
      patientId: this.patientId,
    })
    .then((data) => {
      console.log('Data==>'+JSON.stringify(data));
      data.map((appointment) => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const userLocale = navigator.language;
        console.log('timezone===>'+timezone);
        console.log('userLocale===>'+userLocale);
        console.log('Before start conveting===>'+appointment.Appointment_Start_Time__c);
        appointment.Appointment_Start_Time__c = new Date(appointment.Appointment_Start_Time__c.toLocaleString(userLocale, {timeZone: timezone}));
        console.log('after start conveting===>'+appointment.Appointment_Start_Time__c);
        appointment.Appointment_End_Time__c = new Date(appointment.Appointment_End_Time__c.toLocaleString(userLocale, {timeZone: timezone}));;
          var obj = {
            id: appointment.Id,
            title: appointment.Name,
            start: appointment.Appointment_Start_Time__c,
            end: appointment.Appointment_End_Time__c,
            extendedProps: {
              appointmentId: appointment.Id,
              appointmentName: appointment.Name,
            },
            editable: false,
            backgroundColor: "#0176d3",
            borderColor: "white",
            color: "white",
          };
          this.allEvents.push(obj);
        });
      //});
      this.initialiseFullCalendarJs();
    })
    .catch((error) => {
      console.log("Error===>" + JSON.stringify(error));
    });
  }
  appointmentClose(){
    this.appointmentId = "";
  }
}
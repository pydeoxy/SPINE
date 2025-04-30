import React from "react";
import {
  KafkaSourceFormValues,
  KafkaSourceFormValuesConsumer,
  KafkaSourceFormValuesPreview,
  KafkaSourceFormValuesDeserialization,
  KafkaSourceFormValuesEventTime,
  KafkaSourceFormValuesSchema,
} from "./schemas";
import { ConsumerSection } from "./ConsumerSection";
import { PreviewSection } from "./PreviewSection";
import { DeserializationSection } from "./DeserializationSection";
import { FieldsSection } from "./FieldsSection";
import { EventTimeSection } from "./EventTimeSection";
import { Accordion } from "@/client/components/basics/accordion";

interface KafkaSourceProps {
  data: KafkaSourceFormValues;
  setData: (data: KafkaSourceFormValues) => Promise<boolean>;
}

export const KafkaSource: React.FC<KafkaSourceProps> = ({ data, setData }) => {
  // Handler for applying changes
  const handleApply = async (
    section: string,
    consumerData:
      | KafkaSourceFormValuesConsumer
      | KafkaSourceFormValuesPreview
      | KafkaSourceFormValuesDeserialization
      | KafkaSourceFormValuesSchema
      | KafkaSourceFormValuesEventTime
  ) => {
    await setData({
      ...data,
      [section]: consumerData,
    });

    // For demo purposes
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  };

  return (
    <Accordion type="multiple" className="w-full" defaultValue={["consumer"]}>
      <ConsumerSection
        data={data.consumer}
        onApply={(data: KafkaSourceFormValuesConsumer) =>
          handleApply("consumer", data)
        }
      />
      <PreviewSection
        data={data.preview}
        onApply={(data: KafkaSourceFormValuesPreview) =>
          handleApply("preview", data)
        }
      />
      <DeserializationSection
        data={data.deserialization}
        onApply={(data: KafkaSourceFormValuesDeserialization) =>
          handleApply("deserialization", data)
        }
      />
      <FieldsSection
        data={data.schema}
        onApply={(data: KafkaSourceFormValuesSchema) =>
          handleApply("schema", data)
        }
      />
      <EventTimeSection
        data={data.eventTime}
        onApply={(data: KafkaSourceFormValuesEventTime) =>
          handleApply("eventTime", data)
        }
      />
    </Accordion>
  );
};

export default KafkaSource;

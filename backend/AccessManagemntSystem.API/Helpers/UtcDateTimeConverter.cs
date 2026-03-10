using System.Text.Json;
using System.Text.Json.Serialization;

namespace AccessManagemntSystem.API.Helpers
{
    public class UtcDateTimeConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader,
            Type typeToConvert, JsonSerializerOptions options)
            => DateTime.Parse(reader.GetString()!).ToUniversalTime();

        public override void Write(Utf8JsonWriter writer,
            DateTime value, JsonSerializerOptions options)
            // Always write as UTC with Z suffix
            => writer.WriteStringValue(
                DateTime.SpecifyKind(value, DateTimeKind.Utc)
                        .ToString("yyyy-MM-ddTHH:mm:ssZ"));
    }
}